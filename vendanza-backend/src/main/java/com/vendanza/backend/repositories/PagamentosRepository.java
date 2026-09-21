package com.vendanza.backend.repositories;

import com.vendanza.backend.models.Pagamentos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PagamentosRepository extends JpaRepository<Pagamentos, Integer> {

    // Pagamentos de um encarregado específico
    List<Pagamentos> findByIdEncEducacao(Integer idEncEducacao);

    // Pagamentos por tipo (1=Mensalidade, 2=Artefacto, 3=Coaching)
    List<Pagamentos> findByTipoPagamento(Integer tipoPagamento);
}
