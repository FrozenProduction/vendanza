package com.vendanza.backend.repositories;

import com.vendanza.backend.models.AulaPrivada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AulaPrivadaRepository extends JpaRepository<AulaPrivada, Integer> {
    List<AulaPrivada> findByIdDocente(Integer idDocente);
    List<AulaPrivada> findByIdEncEducacao(Integer idEncEducacao);
}