package com.vendanza.backend.controllers;

import com.vendanza.backend.models.*;
import com.vendanza.backend.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/aulas-privadas")
@CrossOrigin(origins = "*")
public class AulaPrivadaController {

    @Autowired private AulaPrivadaRepository repository;
    @Autowired private AulaRepository aulaRepository;
    @Autowired private TipoAulaRepository tipoAulaRepository;
    //@Autowired private ModalidadeRepository modalidadeRepository;
    //@Autowired private EstudioRepository estudioRepository;
    //@Autowired private DadosDocenteRepository docenteRepository;
    //@Autowired private DadosAlunoRepository alunoRepository;
    //@Autowired private PresencasRepository presencasRepository;

    //#region VITOR

    @GetMapping
    public ResponseEntity<?> listarAulasPrivadas() {
        try {
            List<AulaPrivada> lista = repository.findAll();
            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro ao carregar aulas: " + e.getMessage());
        }
    }

       // PROCURAR POR ID (Para edição)
    @GetMapping("/{id}")
    public ResponseEntity<AulaPrivada> buscarPorId(@PathVariable Integer id) {
        return repository.findById(id) // Corrigido de aulaPrivadaRepository para repository
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GUARDAR OU ATUALIZAR
    @PostMapping("/guardar")
    public ResponseEntity<?> salvar(@RequestBody Map<String, Object> payload) {
        try {
            AulaPrivada aula = new AulaPrivada();

            if (payload.get("idAulaPrivada") != null) {
                aula.setIdAulaPrivada(Integer.parseInt(payload.get("idAulaPrivada").toString()));
            }

            // O tipo de aula blindado
            if (payload.containsKey("cod_tipoaula")) {
                aula.setCod_tipoaula(Integer.parseInt(payload.get("cod_tipoaula").toString()));
            } else if (payload.containsKey("codTipoAula")) {
                aula.setCod_tipoaula(Integer.parseInt(payload.get("codTipoAula").toString()));
            } else {
                throw new RuntimeException("O campo Tipo de Aula está em falta no envio!");
            }

            aula.setDia(LocalDate.parse(payload.get("dia").toString()));
            aula.setHoraInicio(LocalTime.parse(payload.get("horaInicio").toString()));
            aula.setHoraFim(LocalTime.parse(payload.get("horaFim").toString()));

            if (payload.get("preco") != null) aula.setPreco(Float.parseFloat(payload.get("preco").toString()));
            if (payload.get("duracao") != null) aula.setDuracao(Integer.parseInt(payload.get("duracao").toString()));
            aula.setEstado(payload.get("estado") != null ? payload.get("estado").toString() : "Agendada");

            // Modalidade e Estudio
            if (payload.get("modalidade") != null) {
                Map<?, ?> mod = (Map<?, ?>) payload.get("modalidade");
                Modalidade m = new Modalidade();
                m.setIdModalidade(Integer.parseInt(mod.get("idModalidade").toString()));
                aula.setModalidade(m);
            }

            if (payload.get("estudio") != null) {
                Map<?, ?> est = (Map<?, ?>) payload.get("estudio");
                Estudio e = new Estudio();
                e.setIdEstudio(Integer.parseInt(est.get("idEstudio").toString()));
                aula.setEstudio(e);
            }

            // Apenas IDs simples para gravar (Docente e Aluno)
            if (payload.get("idDocente") != null) {
                aula.setIdDocente(Integer.parseInt(payload.get("idDocente").toString()));
            }
            if (payload.get("idEncEducacao") != null) {
                aula.setIdEncEducacao(Integer.parseInt(payload.get("idEncEducacao").toString()));
            }

            AulaPrivada guardada = repository.save(aula);
            return ResponseEntity.ok(guardada);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro interno forçado: " + e.getMessage());
        }
    }

    // ELIMINAR
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            if (repository.existsById(id)) { // Corrigido para repository
                repository.deleteById(id);   // Corrigido para repository
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao eliminar: " + e.getMessage());
        }
    }
 
    @PostMapping
    public ResponseEntity<?> criarAulaPrivada(@RequestBody Map<String, Object> payload) {
        System.out.println("DEBUG: Recebido pedido para criar aula privada: " + payload);
        try {
            AulaPrivada aula = new AulaPrivada();

            // Modalidade
            if (payload.get("idModalidade") != null) {
                Modalidade m = new Modalidade();
                m.setIdModalidade(Integer.parseInt(payload.get("idModalidade").toString()));
                aula.setModalidade(m);
            }

            // Estudio
            if (payload.get("idEstudio") != null) {
                Estudio e = new Estudio();
                e.setIdEstudio(Integer.parseInt(payload.get("idEstudio").toString()));
                aula.setEstudio(e);
            }

            // Docente
            if (payload.get("idDocente") != null) {
                aula.setIdDocente(Integer.parseInt(payload.get("idDocente").toString()));
            }

            // Encarregado / Aluno
            if (payload.get("idEncEducacao") != null) {
                Integer idEnc = Integer.parseInt(payload.get("idEncEducacao").toString());
                System.out.println("DEBUG: Guardando idEncEducacao: " + idEnc);
                aula.setIdEncEducacao(idEnc);
            } else if (payload.get("idAlunos") != null) {
                // Se vier uma lista, pegamos no primeiro para cumprir a constraint da BD
                List<?> ids = (List<?>) payload.get("idAlunos");
                if (!ids.isEmpty()) {
                    Integer idEnc = Integer.parseInt(ids.get(0).toString());
                    System.out.println("DEBUG: Guardando idEncEducacao (de idAlunos): " + idEnc);
                    aula.setIdEncEducacao(idEnc);
                }
            }

            // Tipo de Aula (cod_tipoaula)
            String format = (String) payload.get("format");
            if ("solo".equals(format)) aula.setCod_tipoaula(1);
            else if ("duet".equals(format)) aula.setCod_tipoaula(2);
            else if ("trio".equals(format)) aula.setCod_tipoaula(3);
            else if ("ensemble".equals(format)) aula.setCod_tipoaula(4);
            else aula.setCod_tipoaula(1);

            // Data e Hora
            aula.setDia(LocalDate.parse(payload.get("dia").toString()));
            aula.setHoraInicio(LocalTime.parse(payload.get("horaInicio").toString()));
            
            // Duração e Hora Fim
            Integer duracao = payload.get("duration") != null ? Integer.parseInt(payload.get("duration").toString()) : 60;
            aula.setDuracao(duracao);
            aula.setHoraFim(aula.getHoraInicio().plusMinutes(duracao));

            // Preço e Estado
            aula.setPreco(payload.get("preco") != null ? Float.parseFloat(payload.get("preco").toString()) : 0.0f);
            aula.setEstado("Pendente");

            AulaPrivada guardada = repository.save(aula);
            System.out.println("DEBUG: Aula guardada com ID: " + guardada.getIdAulaPrivada() + " para o encarregado: " + guardada.getIdEncEducacao());
            return ResponseEntity.ok(guardada);
        } catch (Exception e) {
            System.err.println("DEBUG: Erro ao criar aula: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro ao criar aula privada: " + e.getMessage());
        }
    }

    @GetMapping("/encarregado/{id}")
    public ResponseEntity<?> listarAulasPorEncarregado(@PathVariable Integer id) {
        try {
            List<AulaPrivada> lista = repository.findByIdEncEducacao(id);
            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro ao carregar aulas do encarregado: " + e.getMessage());
        }
    }

    @GetMapping("/docente/{idDocente}")
    public ResponseEntity<?> listarAulasDoDocente(@PathVariable Integer idDocente) {
        try {
            List<AulaPrivada> lista = repository.findByIdDocente(idDocente);
            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro ao carregar aulas do docente: " + e.getMessage());
        }
    }

    // 2. Atualiza o estado da aula (ex: De "Pedido" para "Pendente" e depois "Concluída")
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> atualizarEstado(@PathVariable Integer id, @RequestBody Map<String, String> payload) {
        try {
            AulaPrivada aula = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Aula não encontrada"));
            
            String novoEstado = payload.get("estado");

            if ("Pago".equals(novoEstado)) {
                if ("Pedido".equals(aula.getEstado()) || "Pendente".equals(aula.getEstado()) || "Agendada".equals(aula.getEstado())) {
                    return ResponseEntity.status(400).body(Map.of("erro", "Não pode marcar como 'Pago' uma aula que ainda não foi 'Realizada'."));
                }
            }

            aula.setEstado(novoEstado);
            repository.save(aula);

            // NOVO: Se o estado mudou para Realizada ou Falta, inserimos na tabela de aulas global
            if ("Realizada".equals(aula.getEstado()) || "Falta".equals(aula.getEstado())) {
                inserirNaTabelaAulas(aula);
            }
            
            return ResponseEntity.ok(aula);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro ao atualizar estado: " + e.getMessage());
        }
    }

    private void inserirNaTabelaAulas(AulaPrivada ap) {
        Optional<Aula> aulaExistente = aulaRepository.findByIdAulaPrivada(ap.getIdAulaPrivada());
        if (aulaExistente.isEmpty()) {
            Aula nova = new Aula();
            nova.setIdModalidade(ap.getModalidade() != null ? ap.getModalidade().getIdModalidade() : 0);
            
            // Garantir que o Tipo de Aula é carregado (importante para evitar erro de NOT NULL na BD)
            if (ap.getTipoAula() != null) {
                nova.setTipoAula(ap.getTipoAula());
            } else if (ap.getCod_tipoaula() != null) {
                tipoAulaRepository.findById(ap.getCod_tipoaula()).ifPresent(nova::setTipoAula);
            }
            
            nova.setIdEstudio(ap.getEstudio() != null ? ap.getEstudio().getIdEstudio() : 0);
            nova.setHoraInicio(ap.getHoraInicio());
            nova.setHoraFim(ap.getHoraFim());
            nova.setIdAulaPrivada(ap.getIdAulaPrivada());
            nova.setDataAula(ap.getDia());
            aulaRepository.save(nova);
        }
    }
}