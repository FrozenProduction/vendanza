package com.vendanza.backend.controllers;

import com.vendanza.backend.models.Modalidade;
import com.vendanza.backend.models.ModalidadeDocente;
import com.vendanza.backend.repositories.ModalidadeDocenteRepository;
import com.vendanza.backend.repositories.ModalidadeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/modalidade")
public class ModalidadeController {

    @Autowired
    private ModalidadeRepository modalidadeRepository;

    @Autowired
    private ModalidadeDocenteRepository modDocenteRepo;

    // ==========================================
    //  CRUD DE MODALIDADE
    // ==========================================
    @GetMapping("/modalidades")
    public List<Modalidade> getModalidades() {
        return modalidadeRepository.findAll();
    }


    // 2. BUSCAR POR ID (Para Edição)
    @GetMapping("/modalidades/{id}")
    public ResponseEntity<Modalidade> buscarModalidadePorId(@PathVariable Integer id) {
        return modalidadeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. GUARDAR / ATUALIZAR
    @PostMapping("/guardar")
    public ResponseEntity<?> salvarModalidade(@RequestBody Modalidade modalidade) {
        try {
            Modalidade guardada = modalidadeRepository.save(modalidade);
            return ResponseEntity.ok(guardada);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao guardar modalidade: " + e.getMessage());
        }
    }

    // 4. ELIMINAR
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminarModalidade(@PathVariable Integer id) {
        try {
            if (modalidadeRepository.existsById(id)) {
                modalidadeRepository.deleteById(id);
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao eliminar modalidade: " + e.getMessage());
        }
    }


    // ==========================================
    //  CRUD DE MODALIDADE-DOCENTE (ATRIBUIÇÕES)
    // ==========================================

    @GetMapping("/modalidade-docente")
    public List<ModalidadeDocente> listarAtribuicoes() {
        return modDocenteRepo.findAll();
    }

    // Endpoint para o filtro dinâmico: /api/modalidade/docentes-por-modalidade/{id}
    @GetMapping("/docentes-por-modalidade/{id}")
    public ResponseEntity<List<ModalidadeDocente>> listarDocentesPorModalidade(@PathVariable Integer id) {
        try {
            // Chamamos o método que criaste no Repositório
            List<ModalidadeDocente> lista = modDocenteRepo.findByModalidade_IdModalidade(id);
            
            if (lista.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            
            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    //-----------------

    // 2. BUSCAR POR ID (Para Edição)
    @GetMapping("/modalidade-docente/{id}")
    public ResponseEntity<ModalidadeDocente> buscarAtribuicaoPorId(@PathVariable Integer id) {
        return modDocenteRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. GUARDAR / ATUALIZAR
    @PostMapping("/modalidade-docente/guardar")
    public ResponseEntity<?> salvarAtribuicao(@RequestBody ModalidadeDocente atribuicao) {
        try {
            ModalidadeDocente guardada = modDocenteRepo.save(atribuicao);
            return ResponseEntity.ok(guardada);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao guardar atribuição: " + e.getMessage());
        }
    }

    // 4. ELIMINAR
    @DeleteMapping("/modalidade-docente/eliminar/{id}")
    public ResponseEntity<?> eliminarAtribuicao(@PathVariable Integer id) {
        try {
            if (modDocenteRepo.existsById(id)) {
                modDocenteRepo.deleteById(id);
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao eliminar atribuição: " + e.getMessage());
        }
    }
}
