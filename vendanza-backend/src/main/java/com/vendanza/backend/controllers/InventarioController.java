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
    @Transactional
    public ResponseEntity<?> criarAluguer(@RequestBody Aluguer aluguer) {
        try {
            Optional<Artefacto> artOpt = artefactoRepository.findById(aluguer.getIdArtefacto());
            if (artOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Artefacto não encontrado.");
            }
            Artefacto art = artOpt.get();

            String estadoPedido = aluguer.getEstado();

            // Pedido à direção: peça continua disponível; não marca Alugado
            if (!isLegacyImmediateRental(estadoPedido)) {
                if (hasActiveRental(aluguer.getIdArtefacto())) {
                    return ResponseEntity.badRequest().body("Este artefacto já está alugado.");
                }
                art.setDisponibilidade(DISPONIVEL);
                artefactoRepository.save(art);

                aluguer.setEstado(ESTADO_AGUARDAR);
                Aluguer novoAluguer = aluguerRepository.save(aluguer);
                return ResponseEntity.ok(novoAluguer);
            }

            // Fluxo legado (pagamento imediato)
            if (hasActiveRental(aluguer.getIdArtefacto())) {
                return ResponseEntity.badRequest().body("Este artefacto já está alugado.");
            }
            Aluguer novoAluguer = aluguerRepository.save(aluguer);
            art.setDisponibilidade(ALUGADO);
            artefactoRepository.save(art);

            Pagamentos novoPagamento = new Pagamentos();
            novoPagamento.setTipoPagamento(2);
            novoPagamento.setIdEncEducacao(aluguer.getIdEncEducacao());
            novoPagamento.setIdAluguer(novoAluguer.getId());
            novoPagamento.setValor(aluguer.getValor());
            novoPagamento.setData(java.time.LocalDate.now());
            pagamentosRepository.save(novoPagamento);

            return ResponseEntity.ok(novoAluguer);
        } catch (Exception e) {
            log.error("Erro ao processar aluguer", e);
            return ResponseEntity.internalServerError().body("Erro ao processar aluguer. Tente novamente.");
        }
    }

    @GetMapping("/alugueres/pendentes")
    public List<Aluguer> listarAlugueresPendentes() {
        List<Aluguer> pendentes = aluguerRepository.findPedidosAguardandoAprovacao();
        for (Aluguer a : pendentes) {
            if (!ESTADO_AGUARDAR.equals(a.getEstado())) {
                a.setEstado(ESTADO_AGUARDAR);
                aluguerRepository.save(a);
            }
        }
        return pendentes;
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
    @Transactional
    public ResponseEntity<?> aprovarAluguer(@PathVariable Integer id) {
        try {
            Optional<Aluguer> aluguerOpt = aluguerRepository.findById(id);
            if (aluguerOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            Aluguer aluguer = aluguerOpt.get();
            if (!isEstadoPendente(aluguer.getEstado())) {
                return ResponseEntity.badRequest().body("Este pedido já foi processado.");
            }

            Optional<Artefacto> artOpt = artefactoRepository.findById(aluguer.getIdArtefacto());
            if (artOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Artefacto não encontrado.");
            }
            Artefacto art = artOpt.get();
            if (hasActiveRental(aluguer.getIdArtefacto())) {
                return ResponseEntity.badRequest().body("O artefacto já está alugado.");
            }

            aluguer.setEstado(ESTADO_EM_ALUGUER);
            aluguerRepository.save(aluguer);

            List<Aluguer> outrosPendentes = aluguerRepository.findByIdArtefacto(aluguer.getIdArtefacto());
            for (Aluguer outro : outrosPendentes) {
                if (!outro.getId().equals(id) && isEstadoPendente(outro.getEstado())) {
                    outro.setEstado(ESTADO_RECUSADO);
                    aluguerRepository.save(outro);
                }
            }

            art.setDisponibilidade(ALUGADO);
            artefactoRepository.save(art);

            return ResponseEntity.ok(aluguer);
        } catch (Exception e) {
            log.error("Erro ao aprovar", e);
            return ResponseEntity.internalServerError().body("Erro ao aprovar. Tente novamente.");
        }
    }

    @PutMapping("/aluguer/{id}/recusar")
    @Transactional
    public ResponseEntity<?> recusarAluguer(@PathVariable Integer id) {
        try {
            Optional<Aluguer> aluguerOpt = aluguerRepository.findById(id);
            if (aluguerOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            Aluguer aluguer = aluguerOpt.get();
            if (!isEstadoPendente(aluguer.getEstado())) {
                return ResponseEntity.badRequest().body("Este pedido já foi processado.");
            }
            aluguer.setEstado(ESTADO_RECUSADO);
            aluguerRepository.save(aluguer);

            artefactoRepository.findById(aluguer.getIdArtefacto()).ifPresent(art -> {
                if (!hasActiveRental(art.getId())) {
                    art.setDisponibilidade(DISPONIVEL);
                    artefactoRepository.save(art);
                }
            });

            return ResponseEntity.ok(aluguer);
        } catch (Exception e) {
            log.error("Erro ao recusar", e);
            return ResponseEntity.internalServerError().body("Erro ao recusar. Tente novamente.");
        }
    }

    @PutMapping("/aluguer/{id}/devolver")
    @Transactional
    public ResponseEntity<?> devolverAluguer(@PathVariable Integer id) {
        try {
            Optional<Aluguer> aluguerOpt = aluguerRepository.findById(id);
            if (aluguerOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            Aluguer aluguer = aluguerOpt.get();
            if (!ESTADO_EM_ALUGUER.equals(aluguer.getEstado())) {
                return ResponseEntity.badRequest().body("Apenas alugueres ativos podem ser devolvidos.");
            }
            aluguer.setEstado(ESTADO_CONCLUIDO);
            aluguerRepository.save(aluguer);

            artefactoRepository.findById(aluguer.getIdArtefacto()).ifPresent(art -> {
                art.setDisponibilidade(DISPONIVEL);
                artefactoRepository.save(art);
            });

            return ResponseEntity.ok(aluguer);
        } catch (Exception e) {
            log.error("Erro ao devolver", e);
            return ResponseEntity.internalServerError().body("Erro ao devolver. Tente novamente.");
        }
    }

    private boolean isEstadoPendente(String estado) {
        if (estado == null || estado.isBlank()) {
            return false;
        }
        String n = normalizeEstado(estado);
        return n.contains("aguardar") && n.contains("aprova");
    }

    private boolean isLegacyImmediateRental(String estado) {
        if (estado == null || estado.isBlank()) {
            return false;
        }
        String n = normalizeEstado(estado);
        return n.equals("requisitado e pago") || n.equals("pago");
    }

    private String normalizeEstado(String estado) {
        String s = estado.trim().toLowerCase(java.util.Locale.ROOT);
        s = java.text.Normalizer.normalize(s, java.text.Normalizer.Form.NFD);
        return s.replaceAll("\\p{M}", "");
    }

    private boolean hasActiveRental(Integer idArtefacto) {
        if (idArtefacto == null) {
            return false;
        }
        return !aluguerRepository
                .findByIdArtefactoAndEstado(idArtefacto, ESTADO_EM_ALUGUER)
                .isEmpty();
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
