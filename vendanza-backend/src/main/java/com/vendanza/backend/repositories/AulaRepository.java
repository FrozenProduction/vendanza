package com.vendanza.backend.repositories;

import com.vendanza.backend.models.Aula;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

// Mudámos aqui a última palavra para Integer
public interface AulaRepository extends JpaRepository<Aula, Integer> {
    Optional<Aula> findByIdAulaPrivada(Integer idAulaPrivada);
    Optional<Aula> findByIdHorarioAndDataAula(Integer idHorario, java.time.LocalDate dataAula);
}