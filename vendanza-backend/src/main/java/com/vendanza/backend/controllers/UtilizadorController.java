package com.vendanza.backend.controllers;

import com.vendanza.backend.dto.AuthResponse;
import com.vendanza.backend.dto.LoginRequest;
import com.vendanza.backend.services.UtilizadorService;
import com.vendanza.backend.models.*;
import com.vendanza.backend.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/utilizadores")
@CrossOrigin(origins = "*") 
public class UtilizadorController {

    @Autowired private UtilizadorService utilizadorService;
    @Autowired private UtilizadorRepository utilizadorRepository;
    @Autowired private DadosDirecaoRepository direcaoRepository;
    @Autowired private DadosDocenteRepository docenteRepository;
    @Autowired private DadosAlunoRepository alunoRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = utilizadorService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> registar(@RequestBody Utilizador user) {
        try {
            return ResponseEntity.ok(utilizadorService.registar(user));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PutMapping("/perfil/{id}")
    public ResponseEntity<Utilizador> atualizarPerfil(@PathVariable Integer id, @RequestBody Utilizador novosDados) {
        return ResponseEntity.ok(utilizadorService.atualizarPerfil(id, novosDados));
    }

    @PostMapping("/alunos/completo")
    public ResponseEntity<?> guardarEncarregadoCompleto(@RequestBody Map<String, Object> payload) {
        try {
            return ResponseEntity.ok(utilizadorService.guardarAlunoCompleto(payload));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/docentes/completo")
    public ResponseEntity<?> guardarDocenteCompleto(@RequestBody Map<String, Object> payload) {
        try {
            return ResponseEntity.ok(utilizadorService.guardarDocenteCompleto(payload));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/direcao2/completo")
    public ResponseEntity<?> salvarDirecaoCompleto(@RequestBody Map<String, Object> payload) {
        try {
            return ResponseEntity.ok(utilizadorService.salvarDirecaoCompleto(payload));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    // Listagens e buscas simples (podem ficar aqui ou passar para o service também)
    @GetMapping
    public ResponseEntity<Iterable<Utilizador>> listarTodos() {
        return ResponseEntity.ok(utilizadorRepository.findAll());
    }

    @GetMapping("/utilizador/{id}")
    public ResponseEntity<Utilizador> buscarPorId(@PathVariable Integer id) {
        return utilizadorRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/utilizador/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            utilizadorRepository.findById(id).ifPresent(user -> {
                if (user.getTipo() == 1) docenteRepository.deleteById(id);
                else if (user.getTipo() == 2) alunoRepository.deleteById(id);
                else if (user.getTipo() == 3) direcaoRepository.deleteById(id);
                utilizadorRepository.delete(user);
            });
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro de integridade.");
        }
    }

    @GetMapping("/alunos")
    public ResponseEntity<List<DadosAluno>> listarEncarregados() {
        return ResponseEntity.ok(alunoRepository.findAll());
    }

    @GetMapping("/docentes")
    public ResponseEntity<List<DadosDocente>> listarDocentes() {
        return ResponseEntity.ok(docenteRepository.findAll());
    }

    @GetMapping("/direcao")
    public ResponseEntity<Iterable<DadosDirecao>> listarDirecao() {
        return ResponseEntity.ok(direcaoRepository.findAll());
    }

    // --- NOVOS ENDPOINTS PARA O DASHBOARD ---

    @GetMapping("/aluno/{id}")
    public ResponseEntity<?> buscarAlunoPorId(@PathVariable Integer id) {
        return alunoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/docente/{id}")
    public ResponseEntity<?> buscarDocentePorId(@PathVariable Integer id) {
        return docenteRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/direcao/{id}")
    public ResponseEntity<?> buscarDirecaoPorId(@PathVariable Integer id) {
        return direcaoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
