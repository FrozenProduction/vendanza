package com.vendanza.backend.repositories;

import com.vendanza.backend.models.TipoAula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TipoAulaRepository extends JpaRepository<TipoAula, Integer> {
}