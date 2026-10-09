package com.vendanza.backend.repositories;

import com.vendanza.backend.models.Horario;
import com.vendanza.backend.models.Modalidade;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HorarioRepository extends JpaRepository<Horario, Integer> {
    List<Horario> findByModalidade(Modalidade modalidade);
}