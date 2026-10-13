package com.vendanza.backend.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.vendanza.backend.models.Pagamentos;
import com.vendanza.backend.repositories.PagamentosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/pagamentos")
@CrossOrigin(origins = "*")
public class PagamentosController {

    private static final Logger log = LoggerFactory.getLogger(PagamentosController.class);

    @Autowired
    private PagamentosRepository pagamentosRepository;

    // GET /api/pagamentos — listar todos
    @GetMapping
    public List<Pagamentos> listarPagamentos() {
        return pagamentosRepository.findAll();
    }

    // GET /api/pagamentos/{id} — buscar por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Integer id) {
        return pagamentosRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/pagamentos/encarregado/{id} — pagamentos de um encarregado
    @GetMapping("/encarregado/{id}")
    public List<Pagamentos> listarPorEncarregado(@PathVariable Integer id) {
        return pagamentosRepository.findByIdEncEducacao(id);
    }

    // POST /api/pagamentos/guardar — criar ou atualizar (CRUD geral)
    @PostMapping("/guardar")
    public ResponseEntity<?> guardar(@RequestBody Pagamentos pagamento) {
        try {
            if (pagamento.getData() == null) {
                pagamento.setData(LocalDate.now());
            }
            Pagamentos salvo = pagamentosRepository.save(pagamento);
            return ResponseEntity.ok(salvo);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("Erro ao guardar", e);
            return ResponseEntity.status(500).body("Erro ao guardar. Tente novamente.");
        }
    }

    // POST /api/pagamentos/coaching — faturar aula privada (chamado pelo faturarAula no JS)
    @PostMapping("/coaching")
    public ResponseEntity<?> faturarCoaching(@RequestBody Pagamentos pagamento) {
        try {
            pagamento.setTipoPagamento(3); // 3 = Coaching
            pagamento.setIdAluguer(null);
            pagamento.setData(LocalDate.now());
            Pagamentos salvo = pagamentosRepository.save(pagamento);
            return ResponseEntity.ok(salvo);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("Erro ao faturar", e);
            return ResponseEntity.status(500).body("Erro ao faturar. Tente novamente.");
        }
    }

    // DELETE /api/pagamentos/eliminar/{id}
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            if (!pagamentosRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            pagamentosRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Erro ao eliminar", e);
            return ResponseEntity.status(500).body("Erro ao eliminar. Tente novamente.");
        }
    }
}
