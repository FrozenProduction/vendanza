package com.vendanza.backend.services;

import com.vendanza.backend.models.Aluguer;
import com.vendanza.backend.models.Artefacto;
import com.vendanza.backend.models.Pagamentos;
import com.vendanza.backend.repositories.AluguerRepository;
import com.vendanza.backend.repositories.ArtefactoRepository;
import com.vendanza.backend.repositories.PagamentosRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * Alugueres: criacao do pedido, aprovacao/recusacao/devolucao, e a manutencao periodica.
 *
 * Antes isto vivia no InventarioController, que acumulava o CRUD de itens, as transicoes de
 * estado e a manutencao. Ficou aqui tudo o que diz respeito a alugueres; o controller passou a
 * delegar. A manutencao corre num job agendado (10 min) e nao dentro de handlers GET.
 */
@Service
public class AluguerService {

    private static final String ESTADO_AGUARDAR = "Aguardar Aprovação";
    private static final String ESTADO_EM_ALUGUER = "Em Aluguer";
    private static final String ESTADO_RECUSADO = "Recusado";
    private static final String ESTADO_CONCLUIDO = "Concluído";
    private static final String DISPONIVEL = "Disponível";
    private static final String ALUGADO = "Alugado";

    private static final Logger log = LoggerFactory.getLogger(AluguerService.class);

    private final AluguerRepository aluguerRepository;
    private final ArtefactoRepository artefactoRepository;
    private final PagamentosRepository pagamentosRepository;

    public AluguerService(AluguerRepository aluguerRepository,
                          ArtefactoRepository artefactoRepository,
                          PagamentosRepository pagamentosRepository) {
        this.aluguerRepository = aluguerRepository;
        this.artefactoRepository = artefactoRepository;
        this.pagamentosRepository = pagamentosRepository;
    }

    // ------------------------------------------------------------------ pedido

    @Transactional
    public ResponseEntity<?> criarAluguer(Aluguer aluguer) {
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

    @Transactional
    public ResponseEntity<?> aprovarAluguer(Integer id) {
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

    @Transactional
    public ResponseEntity<?> recusarAluguer(Integer id) {
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

    @Transactional
    public ResponseEntity<?> devolverAluguer(Integer id) {
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

    /** Pedidos pendentes, com o estado normalizado em memoria (a leitura nao escreve na base de dados). */
    public List<Aluguer> listarPendentes() {
        List<Aluguer> pendentes = aluguerRepository.findPedidosAguardandoAprovacao();
        for (Aluguer a : pendentes) {
            if (!ESTADO_AGUARDAR.equals(a.getEstado())) {
                a.setEstado(ESTADO_AGUARDAR);
            }
        }
        return pendentes;
    }

    // ------------------------------------------------------------------ manutencao

    /** Conclui os alugueres cujo data_fim ja passou e liberta os artefactos. */
    @Transactional
    public int libertarAlugueresExpirados() {
        LocalDateTime agora = LocalDateTime.now();
        int libertados = 0;
        for (Aluguer aluguer : aluguerRepository.findByEstado(ESTADO_EM_ALUGUER)) {
            if (aluguer.getDataFim() != null && aluguer.getDataFim().isBefore(agora)) {
                aluguer.setEstado(ESTADO_CONCLUIDO);
                aluguerRepository.save(aluguer);
                artefactoRepository.findById(aluguer.getIdArtefacto()).ifPresent(art -> {
                    art.setDisponibilidade(DISPONIVEL);
                    artefactoRepository.save(art);
                });
                libertados++;
            }
        }
        return libertados;
    }

    /** Repoe Disponível quando nao ha aluguer Em Aluguer (corrige dados antigos). */
    @Transactional
    public int corrigirInventarioInconsistente() {
        int corrigidos = 0;
        for (Artefacto art : artefactoRepository.findAll()) {
            if (ALUGADO.equals(art.getDisponibilidade()) && !temAluguerAtivo(art.getId())) {
                art.setDisponibilidade(DISPONIVEL);
                artefactoRepository.save(art);
                corrigidos++;
            }
        }
        return corrigidos;
    }

    private boolean temAluguerAtivo(Integer idArtefacto) {
        if (idArtefacto == null) {
            return false;
        }
        List<Aluguer> ativos = aluguerRepository.findByIdArtefactoAndEstado(idArtefacto, ESTADO_EM_ALUGUER);
        return ativos != null && !ativos.isEmpty();
    }

    /** Corre a cada 10 minutos. Uma falha aqui nao pode matar o agendador nem os pedidos. */
    @Scheduled(initialDelayString = "PT1M", fixedDelayString = "PT10M")
    public void manutencaoPeriodica() {
        try {
            int libertados = libertarAlugueresExpirados();
            int corrigidos = corrigirInventarioInconsistente();
            if (libertados > 0 || corrigidos > 0) {
                log.info("Manutencao de alugueres: {} concluidos, {} artefactos corrigidos", libertados, corrigidos);
            }
        } catch (Exception e) {
            log.error("Manutencao de alugueres falhou (os pedidos nao sao afectados)", e);
        }
    }

    // ------------------------------------------------------------------ regras privadas

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
        String s = estado.trim().toLowerCase(Locale.ROOT);
        s = Normalizer.normalize(s, Normalizer.Form.NFD);
        return s.replaceAll("\\p{M}", "");
    }

    private boolean hasActiveRental(Integer idArtefacto) {
        if (idArtefacto == null) {
            return false;
        }
        return !aluguerRepository.findByIdArtefactoAndEstado(idArtefacto, ESTADO_EM_ALUGUER).isEmpty();
    }
}
