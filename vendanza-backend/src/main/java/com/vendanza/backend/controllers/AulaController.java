package com.vendanza.backend.controllers;

// 1. Garante que estes imports estão presentes
import com.vendanza.backend.models.Aula;
import com.vendanza.backend.repositories.AulaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/aulas")
@CrossOrigin(origins = "*")
public class AulaController {

    // 2. O nome aqui deve ser EXATAMENTE o nome da interface que criaste
    @Autowired
    private AulaRepository aulaRepository; 

    @GetMapping
    public List<Aula> listarTudo() {
        return aulaRepository.findAll();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        aulaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}