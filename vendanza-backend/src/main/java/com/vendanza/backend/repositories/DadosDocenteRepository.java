package com.vendanza.backend.repositories;

import com.vendanza.backend.models.DadosDocente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface DadosDocenteRepository extends JpaRepository<DadosDocente, Integer> {
    
}