package com.vendanza.backend.repositories;

import com.vendanza.backend.models.Modalidade;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ModalidadeRepository extends JpaRepository<Modalidade, Integer> {
}