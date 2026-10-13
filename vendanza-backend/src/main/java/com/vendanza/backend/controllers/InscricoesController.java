package com.vendanza.backend.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.vendanza.backend.models.Inscricoes;
import com.vendanza.backend.repositories.InscricoesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
//import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inscricoes")
@CrossOrigin(origins = "*")
public class InscricoesController {

    private static final Logger log = LoggerFactory.getLogger(InscricoesController.class);

    @Autowired
    private InscricoesRepository inscricoesRepository;

    @GetMapping("/inscricoes")
    public List<Inscricoes> listarInscricoes() {
        return inscricoesRepository.findAll();
    }

    @GetMapping("/aluno/{id}")
    public List<Inscricoes> listarInscricoesPorAluno(@PathVariable Integer id) {
        return inscricoesRepository.findByEncarregadoIdEncEducacao(id);
    }

    // 2. BUSCAR POR ID (Para a Edição)
    @GetMapping("/inscricoes/{id}")
    public ResponseEntity<Inscricoes> buscarInscricaoPorId(@PathVariable Integer id) {
        return inscricoesRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. GUARDAR / ATUALIZAR
    @PostMapping("/guardar")
    public ResponseEntity<?> salvarInscricao(@RequestBody Inscricoes inscricao) {
        try {
            Inscricoes guardada = inscricoesRepository.save(inscricao);
            return ResponseEntity.ok(guardada);
        } catch (Exception e) {
            log.error("Erro ao guardar inscrição", e);
            return ResponseEntity.status(500).body("Erro ao guardar inscrição. Tente novamente.");
        }
    }

    // 4. ELIMINAR
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminarInscricao(@PathVariable Integer id) {
        try {
            if (inscricoesRepository.existsById(id)) {
                inscricoesRepository.deleteById(id);
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao eliminar inscrição", e);
            return ResponseEntity.status(500).body("Erro ao eliminar inscrição. Tente novamente.");
        }
    }
}