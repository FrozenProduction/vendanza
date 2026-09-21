package com.vendanza.backend.controllers;
//import com.vendanza.backend.models.DadosAluno;
import com.vendanza.backend.models.Horario;
import com.vendanza.backend.repositories.HorarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/horario")
public class HorarioController {

    @Autowired
    private HorarioRepository horarioRepository;

    // Vai buscar todas as Aulas/Horários (Agora inclui o objeto Modalidade com a descrição)
    @GetMapping
    public ResponseEntity<List<Horario>> getAulasTodas() {
        return ResponseEntity.ok(horarioRepository.findAll());
    }

    // Vai buscar uma Aula/Horário pelo ID
    @GetMapping("/{id}")
    public ResponseEntity<Horario> getAulaPorId(@PathVariable Integer id) {
        return horarioRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Criar um novo Horário
    @PostMapping
    public Horario criarHorario(@RequestBody Horario horario) {
        return horarioRepository.save(horario);
    }

    // Atualizar um Horário existente
    @PutMapping("/{id}")
    public ResponseEntity<Horario> atualizarHorario(@PathVariable Integer id, @RequestBody Horario detalhesHorario) {
        return horarioRepository.findById(id).map(horario -> {
            horario.setModalidade(detalhesHorario.getModalidade());
            horario.setDiaSemana(detalhesHorario.getDiaSemana());
            horario.setHoraInicio(detalhesHorario.getHoraInicio());
            horario.setHoraFim(detalhesHorario.getHoraFim());
            horario.setIdEstudio(detalhesHorario.getIdEstudio());
            Horario atualizado = horarioRepository.save(horario);
            return ResponseEntity.ok(atualizado);
        }).orElse(ResponseEntity.notFound().build());
    }

    // Eliminar um Horário
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarHorario(@PathVariable Integer id) {
        return horarioRepository.findById(id).map(horario -> {
            horarioRepository.delete(horario);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==========================================
    //  CRUD DE HORARIOS
    // ==========================================

    // LISTAR
    @GetMapping("/horarios")
    public ResponseEntity<List<Horario>> listarHorarios() {
        List<Horario> lista = horarioRepository.findAll();
        System.out.println("Horários encontrados: " + lista.size()); // Log para ver no terminal
        return ResponseEntity.ok(lista);
    }

    // Procurar um horário específico por ID (para edição)
    @GetMapping("/horarios/{id}")
    public ResponseEntity<Horario> buscarPorId(@PathVariable Integer id) {
        return horarioRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Guardar (Adicionar ou Atualizar)
    @PostMapping("/horarios/guardar")
    public ResponseEntity<?> guardarHorario(@RequestBody Horario horario) {
        try {
            // Se o ID vier preenchido, o Spring faz Update automaticamente. 
            // Se vier null, faz Insert.
            Horario salvo = horarioRepository.save(horario);
            return ResponseEntity.ok(salvo);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro ao salvar horário: " + e.getMessage());
        }
    }

    // Eliminar Horário
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminarIdHorario(@PathVariable Integer id) {
        try {
            if (horarioRepository.existsById(id)) {
                horarioRepository.deleteById(id);
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            // Caso existam aulas associadas na tabela 'aulas'
            return ResponseEntity.status(500).body("Erro: Não pode eliminar um horário que tem aulas associadas.");
        }
    }
}
