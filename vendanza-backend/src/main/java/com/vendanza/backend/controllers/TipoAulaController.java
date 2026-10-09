package com.vendanza.backend.controllers;

import com.vendanza.backend.models.TipoAula;
import com.vendanza.backend.repositories.TipoAulaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
//import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipos-aula")
@CrossOrigin(origins = "*")
public class TipoAulaController {

    @Autowired
    private TipoAulaRepository tipoAulaRepository;

    @GetMapping("/tipos-aula")
    public List<TipoAula> listarTipoAulas() {
        return tipoAulaRepository.findAll();
    }

    // 2. PROCURAR POR ID (Para a edição)
    @GetMapping("/tipos-aula/{id}")
    public ResponseEntity<TipoAula> buscarPorId(@PathVariable Integer id) {
        return tipoAulaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. GUARDAR / ATUALIZAR
    @PostMapping("/guardar")
    public ResponseEntity<?> salvarTipoAula(@RequestBody TipoAula tipoAula) {
        try {
            TipoAula guardado = tipoAulaRepository.save(tipoAula);
            return ResponseEntity.ok(guardado);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao guardar tipo de aula: " + e.getMessage());
        }
    }

    // 4. ELIMINAR
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminarTipoAula(@PathVariable Integer id) {
        try {
            if (tipoAulaRepository.existsById(id)) {
                tipoAulaRepository.deleteById(id);
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao eliminar: " + e.getMessage());
        }
    }
}