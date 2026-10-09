package com.vendanza.backend.services;

import com.vendanza.backend.dto.AuthResponse;
import com.vendanza.backend.dto.LoginRequest;
import com.vendanza.backend.models.*;
import com.vendanza.backend.repositories.*;
import com.vendanza.backend.security.JwtService;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.Map;

@Service
public class UtilizadorService {

    @Autowired private UtilizadorRepository utilizadorRepository;
    @Autowired private DadosAlunoRepository alunoRepository;
    @Autowired private DadosDocenteRepository docenteRepository;
    @Autowired private DadosDirecaoRepository direcaoRepository;
    @Autowired private JwtService jwtService;

    public AuthResponse login(LoginRequest request) {
        Utilizador user = utilizadorRepository.findFirstByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilizador não encontrado"));

        if (BCrypt.checkpw(request.getPassword(), user.getPassword())) {
            String token = jwtService.generateToken(user.getEmail());
            return new AuthResponse(token, user);
        } else {
            throw new RuntimeException("Credenciais inválidas");
        }
    }

    @Transactional
    public Utilizador registar(Utilizador user) {
        String passeEncriptada = BCrypt.hashpw(user.getPassword(), BCrypt.gensalt());
        user.setPassword(passeEncriptada);
        
        Utilizador novoUser = utilizadorRepository.save(user);
        distribuirPorTabelaPerfil(novoUser, user.getDataNascimento());
        
        return novoUser;
    }

    private void distribuirPorTabelaPerfil(Utilizador user, String dataNascStr) {
        String nomeAUsar = user.getNome() != null ? user.getNome() : "Sem Nome";
        String[] nomes = nomeAUsar.split(" ");
        String primeiroNome = nomes[0];
        String apelido = nomes.length > 1 ? nomes[nomes.length - 1] : "A preencher";
        
        LocalDate dataNasc = LocalDate.now();
        if (dataNascStr != null && !dataNascStr.trim().isEmpty()) {
            try {
                dataNasc = LocalDate.parse(dataNascStr);
            } catch (Exception e) {}
        }

        Integer tipo = user.getTipo();

        if (tipo == 3) { // DIREÇÃO
            DadosDirecao dir = new DadosDirecao();
            dir.setIdDirecao(user.getId());
            dir.setNomeGestor(primeiroNome);
            dir.setApelidoGestor(apelido);
            direcaoRepository.save(dir);
        } else if (tipo == 1) { // PROFESSOR
            DadosDocente doc = new DadosDocente();
            doc.setIdDocente(user.getId());
            doc.setNome(primeiroNome);
            doc.setApelido(apelido);
            doc.setDataNascimento(dataNasc);
            docenteRepository.save(doc);
        } else if (tipo == 2) { // ALUNO
            DadosAluno aluno = new DadosAluno();
            aluno.setIdEncEducacao(user.getId());
            aluno.setNomeAluno(primeiroNome);
            aluno.setApelidoAluno(apelido);
            aluno.setNomeEncEducacao(primeiroNome);
            aluno.setApelidoEncEducacao(apelido);
            aluno.setTelefone("900000000");
            aluno.setIban("PT50000000000000000000000");
            aluno.setNif("000000000");
            aluno.setCp("0000-000");
            aluno.setDataNascimento(dataNasc);
            alunoRepository.save(aluno);
        }
    }

    @Transactional
    public Utilizador atualizarPerfil(Integer id, Utilizador novosDados) {
        Utilizador user = utilizadorRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Utilizador não encontrado"));
        
        String nomeCompleto = novosDados.getNome().trim();
        final String primeiroNome = nomeCompleto.contains(" ") ? nomeCompleto.substring(0, nomeCompleto.indexOf(" ")) : nomeCompleto;
        final String apelido = nomeCompleto.contains(" ") ? nomeCompleto.substring(nomeCompleto.indexOf(" ") + 1) : "";

        user.setNome(nomeCompleto); 
        user.setEmail(novosDados.getEmail());
        utilizadorRepository.save(user);

        alunoRepository.findById(id).ifPresent(aluno -> {
            aluno.setNomeEncEducacao(primeiroNome); 
            aluno.setApelidoEncEducacao(apelido);   
            aluno.setNif(novosDados.getNif());
            aluno.setTelefone(novosDados.getTelemovel());
            alunoRepository.save(aluno);
        });

        docenteRepository.findById(id).ifPresent(docente -> {
            docente.setNome(primeiroNome); 
            docente.setApelido(apelido);   
            docente.setTelefone(novosDados.getTelemovel()); 
            docente.setNif(novosDados.getNif());
            docenteRepository.save(docente);
        });

        direcaoRepository.findById(id).ifPresent(direcao -> {
            direcao.setNomeGestor(primeiroNome);  
            direcao.setApelidoGestor(apelido);    
            direcao.setNif(novosDados.getNif());
            direcao.setTelefone(novosDados.getTelemovel());
            direcaoRepository.save(direcao);
        });

        return user;
    }

    @Transactional
    public Utilizador guardarAlunoCompleto(Map<String, Object> payload) {
        Object idObj = payload.get("id");
        Integer id = (idObj != null && !idObj.toString().isEmpty()) ? Integer.parseInt(idObj.toString()) : null;
        
        Utilizador user = (id != null) ? utilizadorRepository.findById(id).orElse(new Utilizador()) : new Utilizador();
        user.setEmail((String) payload.get("email"));
        user.setNome((String) payload.get("nomeenceducacao") + " " + (String) payload.get("apelidoenceducacao"));
        user.setTipo(2); 
        
        if (payload.get("isactive") != null) {
            user.setIsactive(Short.parseShort(payload.get("isactive").toString()));
        }
        
        if (payload.get("password") != null && !payload.get("password").toString().isEmpty()) {
            user.setPassword(BCrypt.hashpw((String) payload.get("password"), BCrypt.gensalt()));
        }
        
        Utilizador userSalvo = utilizadorRepository.save(user);

        DadosAluno aluno = alunoRepository.findById(userSalvo.getId()).orElse(new DadosAluno());
        aluno.setIdEncEducacao(userSalvo.getId());
        aluno.setNomeAluno((String) payload.get("nomealuno"));
        aluno.setApelidoAluno((String) payload.get("apelidoaluno"));
        aluno.setNomeEncEducacao((String) payload.get("nomeenceducacao"));
        aluno.setApelidoEncEducacao((String) payload.get("apelidoenceducacao"));
        aluno.setTelefone((String) payload.get("telefone"));
        aluno.setIban((String) payload.get("iban"));
        aluno.setNif((String) payload.get("nif"));
        aluno.setCp((String) payload.get("cp"));
        
        Object dataNasc = payload.get("datanascimento");
        if (dataNasc != null && !dataNasc.toString().isEmpty()) {
            aluno.setDataNascimento(java.time.LocalDate.parse(dataNasc.toString()));
        }

        alunoRepository.save(aluno);
        return userSalvo;
    }

    @Transactional
    public Utilizador guardarDocenteCompleto(Map<String, Object> payload) {
        Object idObj = payload.get("id");
        Integer id = (idObj != null && !idObj.toString().isEmpty() && !idObj.toString().equals("null")) 
                    ? Integer.parseInt(idObj.toString()) : null;
        
        Utilizador user = (id != null) ? utilizadorRepository.findById(id).orElse(new Utilizador()) : new Utilizador();
        user.setEmail((String) payload.get("email"));
        user.setNome((String) payload.get("nome") + " " + (String) payload.get("apelido"));
        user.setTipo(1); 
        
        if (payload.get("isactive") != null) {
            user.setIsactive(Short.parseShort(payload.get("isactive").toString()));
        }
        
        if (id == null && (payload.get("password") == null || payload.get("password").toString().isEmpty())) {
            user.setPassword(BCrypt.hashpw("12345", BCrypt.gensalt()));
        } else if (payload.get("password") != null && !payload.get("password").toString().isEmpty()) {
            user.setPassword(BCrypt.hashpw((String) payload.get("password"), BCrypt.gensalt()));
        }
        
        Utilizador userSalvo = utilizadorRepository.save(user);

        DadosDocente docente = docenteRepository.findById(userSalvo.getId()).orElse(new DadosDocente());
        docente.setIdDocente(userSalvo.getId());
        docente.setNome((String) payload.get("nome"));
        docente.setApelido((String) payload.get("apelido"));
        docente.setTelefone((String) payload.get("telefone"));
        docente.setMorada((String) payload.get("morada"));
        docente.setIban((String) payload.get("iban"));
        docente.setNif((String) payload.get("nif"));
        docente.setTipoCoach((String) payload.get("tipocoach"));
        
        Object dataNasc = payload.get("datanascimento");
        if (dataNasc != null && !dataNasc.toString().isEmpty()) {
            docente.setDataNascimento(java.time.LocalDate.parse(dataNasc.toString()));
        }

        docenteRepository.save(docente);
        return userSalvo;
    }

    @Transactional
    public Utilizador salvarDirecaoCompleto(Map<String, Object> payload) {
        Object idObj = payload.get("id");
        Integer id = (idObj != null && !idObj.toString().isEmpty()) ? Integer.parseInt(idObj.toString()) : null;
        
        Utilizador user = (id != null) ? utilizadorRepository.findById(id).orElse(new Utilizador()) : new Utilizador();
        user.setEmail((String) payload.get("email"));
        user.setNome((String) payload.get("nome") + " " + (String) payload.get("apelido"));
        user.setTipo(3); 
        
        if (payload.get("isactive") != null) {
            user.setIsactive(Short.parseShort(payload.get("isactive").toString()));
        }
        
        if (payload.get("password") != null && !payload.get("password").toString().isEmpty()) {
            user.setPassword(BCrypt.hashpw((String) payload.get("password"), BCrypt.gensalt()));
        } else if (id == null) {
            user.setPassword(BCrypt.hashpw("admin123", BCrypt.gensalt())); 
        }
        
        Utilizador userSalvo = utilizadorRepository.save(user);

        DadosDirecao direcao = direcaoRepository.findById(userSalvo.getId()).orElse(new DadosDirecao());
        direcao.setIdDirecao(userSalvo.getId());
        direcao.setNomeGestor((String) payload.get("nome"));
        direcao.setApelidoGestor((String) payload.get("apelido"));
        direcao.setTelefone((String) payload.get("telefone"));
        direcao.setNif((String) payload.get("nif"));

        direcaoRepository.save(direcao);
        return userSalvo;
    }
}
