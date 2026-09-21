package com.vendanza.backend.repositories;

import com.vendanza.backend.models.DadosDirecao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface DadosDirecaoRepository extends JpaRepository<DadosDirecao, Integer> {
    
}