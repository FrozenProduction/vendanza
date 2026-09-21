package com.vendanza.backend.controllers;

//import com.vendanza.backend.models.DadosDirecao;
//import com.vendanza.backend.models.DadosDocente;
import com.vendanza.backend.models.Estudio;
import com.vendanza.backend.repositories.EstudioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
//import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/estudios")
@CrossOrigin(origins = "*")
public class EstudioController {

    @Autowired
    private EstudioRepository estudioRepository;

    @GetMapping("/estudios")
    public List<Estudio> listarEstudios() {
        /*List<Estudio> lista = estudioRepository.findAll();
        System.out.println("Estúdios encontrados: " + lista.size()); // Log para ver no terminal
        return ResponseEntity.ok(lista);*/
        return estudioRepository.findAll();
    }

    // 2. PROCURAR POR ID (Para preencher o form na edição)
    @GetMapping("/estudios/{id}")
    public ResponseEntity<Estudio> buscarPorId(@PathVariable Integer id) {
        return estudioRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. GUARDAR / ATUALIZAR
    @PostMapping("/guardar")
    public ResponseEntity<?> salvarEstudio(@RequestBody Estudio estudio) {
        try {
            Estudio guardado = estudioRepository.save(estudio);
            return ResponseEntity.ok(guardado);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao guardar estúdio: " + e.getMessage());
        }
    }

    // 4. ELIMINAR
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminarEstudio(@PathVariable Integer id) {
        try {
            if (estudioRepository.existsById(id)) {
                estudioRepository.deleteById(id);
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao eliminar estúdio: " + e.getMessage());
        }
    }

}