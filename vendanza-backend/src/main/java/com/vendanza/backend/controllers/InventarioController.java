package com.vendanza.backend.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.vendanza.backend.models.*;
import com.vendanza.backend.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/inventario")
public class InventarioController {

    private static final Logger log = LoggerFactory.getLogger(InventarioController.class);

    @Autowired private ArtefactoRepository artefactoRepository;
    @Autowired private com.vendanza.backend.services.AluguerService aluguerService;
    @Autowired private AluguerRepository aluguerRepository;
    @Autowired private PagamentosRepository pagamentosRepository;

    /** Valor canónico (ASCII) — evita falhas de encoding entre frontend, admin e BD. */
    private static final String ESTADO_AGUARDAR = "Aguardar Aprovacao";
    private static final String ESTADO_EM_ALUGUER = "Em Aluguer";
    private static final String ESTADO_RECUSADO = "Recusado";
    private static final String ESTADO_CONCLUIDO = "Concluído";
    private static final String DISPONIVEL = "Disponível";
    private static final String ALUGADO = "Alugado";

    @GetMapping("/itens")
    public List<Artefacto> listarItens() {
        return artefactoRepository.findAll();
    }

    @PostMapping("/itens")
    public ResponseEntity<?> adicionarItem(@RequestBody Artefacto artefacto) {
        try {
            if (artefacto.getPrecoAluguer() != null && artefacto.getPrecoAluguer() < 0) {
                return ResponseEntity.badRequest().body("O preco de aluguer nao pode ser negativo.");
            }
            if (artefacto.getDisponibilidade() == null) {
                artefacto.setDisponibilidade(DISPONIVEL);
            }
            Artefacto novoItem = artefactoRepository.save(artefacto);
            return ResponseEntity.ok(novoItem);
        } catch (Exception e) {
            log.error("Erro ao salvar peça", e);
            return ResponseEntity.internalServerError().body("Erro ao salvar peça. Tente novamente.");
        }
    }

@PostMapping("/alugar")
    public ResponseEntity<?> criarAluguer(@RequestBody Aluguer aluguer) {
        return aluguerService.criarAluguer(aluguer);
    }

    @GetMapping("/alugueres/pendentes")
    public List<Aluguer> listarAlugueresPendentes() {
        return aluguerService.listarPendentes();
    }

    @GetMapping("/alugueres/ativos")
    public List<Aluguer> listarAlugueresAtivos() {
        return aluguerRepository.findByEstado(ESTADO_EM_ALUGUER);
    }

    @GetMapping("/meus-alugueres/{idEnc}")
    public List<Aluguer> listarMeusAlugueres(@PathVariable Integer idEnc) {
        return aluguerRepository.findByIdEncEducacao(idEnc);
    }

@PutMapping("/aluguer/{id}/aprovar")
    public ResponseEntity<?> aprovarAluguer(@PathVariable Integer id) {
        return aluguerService.aprovarAluguer(id);
    }

@PutMapping("/aluguer/{id}/recusar")
    public ResponseEntity<?> recusarAluguer(@PathVariable Integer id) {
        return aluguerService.recusarAluguer(id);
    }

@PutMapping("/aluguer/{id}/devolver")
    public ResponseEntity<?> devolverAluguer(@PathVariable Integer id) {
        return aluguerService.devolverAluguer(id);
    }

                        @PutMapping("/itens/{id}")
    public ResponseEntity<?> atualizarItem(@PathVariable Integer id, @RequestBody Artefacto detalhes) {
        return artefactoRepository.findById(id).map(item -> {
            if (detalhes.getPrecoAluguer() != null && detalhes.getPrecoAluguer() < 0) {
                return ResponseEntity.badRequest().body("O preco de aluguer nao pode ser negativo.");
            }
            item.setDescricao(detalhes.getDescricao());
            item.setCategoria(detalhes.getCategoria());
            item.setTamanho(detalhes.getTamanho());
            item.setEstado(detalhes.getEstado());
            item.setTelefone(detalhes.getTelefone());
            item.setPrecoAluguer(detalhes.getPrecoAluguer());
            item.setDisponibilidade(detalhes.getDisponibilidade());
            item.setIdDocente(detalhes.getIdDocente());
            if (detalhes.getImagem() != null && !detalhes.getImagem().isEmpty()) {
                item.setImagem(detalhes.getImagem());
            }
            artefactoRepository.save(item);
            return ResponseEntity.ok(item);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/itens/{id}")
    public ResponseEntity<?> apagarItem(@PathVariable Integer id) {
        return artefactoRepository.findById(id).map(item -> {
            artefactoRepository.delete(item);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/itens/{id}")
    public ResponseEntity<Artefacto> buscarPorId(@PathVariable Integer id) {
        return artefactoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/itens2/{id}")
    public ResponseEntity<?> atualizarItens(@PathVariable Integer id, @RequestBody Artefacto detalhes) {
        return artefactoRepository.findById(id).map(item -> {
            if (detalhes.getPrecoAluguer() != null && detalhes.getPrecoAluguer() < 0) {
                return ResponseEntity.badRequest().body("O preco de aluguer nao pode ser negativo.");
            }
            item.setDescricao(detalhes.getDescricao());
            item.setCategoria(detalhes.getCategoria());
            item.setTamanho(detalhes.getTamanho());
            item.setEstado(detalhes.getEstado());
            item.setTelefone(detalhes.getTelefone());
            item.setPrecoAluguer(detalhes.getPrecoAluguer());
            item.setDisponibilidade(detalhes.getDisponibilidade());
            item.setIdDocente(detalhes.getIdDocente());
            item.setIdEncEducacao(detalhes.getIdEncEducacao());
            item.setIdDirecao(detalhes.getIdDirecao());
            if (detalhes.getImagem() != null && !detalhes.getImagem().isEmpty()) {
                item.setImagem(detalhes.getImagem());
            }
            artefactoRepository.save(item);
            return ResponseEntity.ok(item);
        }).orElse(ResponseEntity.notFound().build());
    }
}
