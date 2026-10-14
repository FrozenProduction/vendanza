package com.vendanza.backend.services;

import com.vendanza.backend.models.Aluguer;
import com.vendanza.backend.models.Artefacto;
import com.vendanza.backend.repositories.AluguerRepository;
import com.vendanza.backend.repositories.ArtefactoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Manutencao do inventario e dos alugueres.
 *
 * Antes isto vivia dentro de handlers GET (listar itens, alugueres pendentes/ativos, meus
 * alugueres): um pedido de LEITURA escrevia na base de dados e fazia uma query por artefacto
 * (N+1). Agora corre num job agendado, e os GET passaram a ser so de leitura.
 */
@Service
public class InventarioManutencaoService {

    private static final String ESTADO_EM_ALUGUER = "Em Aluguer";
    private static final String ESTADO_CONCLUIDO = "Concluído";
    private static final String DISPONIVEL = "Disponível";
    private static final String ALUGADO = "Alugado";

    private static final Logger log = LoggerFactory.getLogger(InventarioManutencaoService.class);

    private final ArtefactoRepository artefactoRepository;
    private final AluguerRepository aluguerRepository;

    public InventarioManutencaoService(ArtefactoRepository artefactoRepository,
                                       AluguerRepository aluguerRepository) {
        this.artefactoRepository = artefactoRepository;
        this.aluguerRepository = aluguerRepository;
    }

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
                log.info("Manutencao do inventario: {} alugueres concluidos, {} artefactos corrigidos",
                        libertados, corrigidos);
            }
        } catch (Exception e) {
            log.error("Manutencao do inventario falhou (os pedidos nao sao afectados)", e);
        }
    }
}
