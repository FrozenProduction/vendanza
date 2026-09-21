package com.vendanza.backend.repositories;

import com.vendanza.backend.models.Presencas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;
import java.time.LocalDate;

@Repository
public interface PresencasRepository extends JpaRepository<Presencas, Integer> {
    Optional<Presencas> findByEncarregadoIdEncEducacaoAndAulaIdHorarioAndAulaDataAula(Integer idEncEducacao, Integer idHorario, LocalDate dataAula);
    List<Presencas> findByEncarregadoIdEncEducacao(Integer idEncEducacao);
}