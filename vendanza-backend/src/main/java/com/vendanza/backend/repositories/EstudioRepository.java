package com.vendanza.backend.repositories;

import com.vendanza.backend.models.Estudio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstudioRepository extends JpaRepository<Estudio, Integer> {
}
