package com.vendanza.backend.controllers;

import com.vendanza.backend.models.*;
import com.vendanza.backend.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/presencas")
@CrossOrigin(origins = "*")
public class PresencaController {

    @Autowired private PresencasRepository presencasRepository;
    @Autowired private AulaRepository aulaRepository;
    @Autowired private HorarioRepository horarioRepository;
    @Autowired private TipoAulaRepository tipoAulaRepository;
    @Autowired private DadosAlunoRepository alunoRepository;
    @Autowired private DadosDocenteRepository docenteRepository;

    @GetMapping("/presencas")
    public List<Presencas> listarTodas() {
        return presencasRepository.findAll();
    }

    @GetMapping("/verificar")
    public ResponseEntity<?> verificarPresenca(@RequestParam Integer idEncarregado, @RequestParam Integer idHorario, @RequestParam String dataAula) {
        try {
            LocalDate date = LocalDate.parse(dataAula);
            Optional<Presencas> presenca = presencasRepository.findByEncarregadoIdEncEducacaoAndAulaIdHorarioAndAulaDataAula(idEncarregado, idHorario, date);
            return ResponseEntity.ok(Map.of("presente", presenca.isPresent()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao verificar presença: " + e.getMessage());
        }
    }

    @GetMapping("/aluno/{id}")
    public ResponseEntity<?> listarPresencasAluno(@PathVariable Integer id) {
        try {
            List<Presencas> lista = presencasRepository.findByEncarregadoIdEncEducacao(id);
            
            List<Map<String, Object>> resumo = new java.util.ArrayList<>();
            for (Presencas p : lista) {
                if (p.getAula() != null && p.getAula().getIdHorario() != null) {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("idHorario", p.getAula().getIdHorario());
                    map.put("data", p.getAula().getDataAula().toString());
                    resumo.add(map);
                }
            }
            return ResponseEntity.ok(resumo);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro ao listar presenças: " + e.getMessage());
        }
    }

    @PostMapping("/marcar")
    public ResponseEntity<?> marcarPresenca(@RequestBody Map<String, Object> payload) {
        try {
            Integer idHorario = (Integer) payload.get("idHorario");
            String dataAulaStr = (String) payload.get("dataAula");
            LocalDate dataAula = LocalDate.parse(dataAulaStr);
            String estado = (String) payload.get("estado");
            Integer idEncarregado = payload.containsKey("idEncarregado") ? (Integer) payload.get("idEncarregado") : null;
            Integer idDocente = payload.containsKey("idDocente") ? (Integer) payload.get("idDocente") : null;

            // 0. Verificar se já existe presença
            if (idEncarregado != null) {
                Optional<Presencas> existe = presencasRepository.findByEncarregadoIdEncEducacaoAndAulaIdHorarioAndAulaDataAula(idEncarregado, idHorario, dataAula);
                if (existe.isPresent()) {
                    return ResponseEntity.status(400).body(Map.of("message", "Presença já registada anteriormente."));
                }
            }

            // 1. Procurar ou Criar a Aula
            Aula aula;
            Optional<Aula> aulaOpt = aulaRepository.findByIdHorarioAndDataAula(idHorario, dataAula);
            if (aulaOpt.isPresent()) {
                aula = aulaOpt.get();
            } else {
                Horario h = horarioRepository.findById(idHorario).orElseThrow(() -> new RuntimeException("Horário não encontrado"));
                aula = new Aula();
                aula.setIdModalidade(h.getModalidade() != null ? h.getModalidade().getIdModalidade() : 0);
                
                Optional<TipoAula> tipoRegular = tipoAulaRepository.findById(5);
                if (tipoRegular.isPresent()) {
                    aula.setTipoAula(tipoRegular.get());
                } else {
                    Optional<TipoAula> tipoFallback = tipoAulaRepository.findById(1);
                    tipoFallback.ifPresent(aula::setTipoAula);
                }
                
                aula.setIdHorario(h.getIdHorario());
                aula.setIdEstudio(h.getIdEstudio());
                aula.setHoraInicio(h.getHoraInicio());
                aula.setHoraFim(h.getHoraFim());
                aula.setDataAula(dataAula);
                aula = aulaRepository.save(aula);
            }

            // 2. Registar a Presença
            Presencas presenca = new Presencas();
            presenca.setAula(aula);
            presenca.setEstado(estado);
            
            if (idEncarregado != null) {
                DadosAluno aluno = alunoRepository.findById(idEncarregado).orElse(null);
                presenca.setEncarregado(aluno);
            }
            if (idDocente != null) {
                DadosDocente docente = docenteRepository.findById(idDocente).orElse(null);
                presenca.setDocente(docente);
            }
            
            // Faltava só garantir que o docente vem do Horario caso não seja enviado, 
            // porque no dbfinal.sql `id_docente` e `id_enceducacao` em presencas são obrigatórios (NOT NULL).
            // Se for aluno a marcar a sua própria, precisa de um docente? Se for obrigatório, usamos o do Horario.
            if (presenca.getDocente() == null) {
                Horario h = horarioRepository.findById(idHorario).orElse(null);
                if (h != null && h.getIdDocente() != null) {
                    DadosDocente doc = docenteRepository.findById(h.getIdDocente()).orElse(null);
                    presenca.setDocente(doc);
                } else {
                    // Forçar um id = 32 por exemplo se for nulo, apenas para não rebentar por restrição de DB
                    // Mas idealmente os horários já têm professor.
                }
            }
            
            presencasRepository.save(presenca);

            return ResponseEntity.ok(Map.of("message", "Presença marcada com sucesso!", "idAula", aula.getIdAula()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro ao marcar presença: " + e.getMessage());
        }
    }
}