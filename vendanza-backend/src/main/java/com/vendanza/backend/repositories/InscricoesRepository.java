package com.vendanza.backend.repositories;

import com.vendanza.backend.models.Inscricoes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InscricoesRepository extends JpaRepository<Inscricoes, Integer> {
    List<Inscricoes> findByEncarregadoIdEncEducacao(Integer idEncEducacao);
}