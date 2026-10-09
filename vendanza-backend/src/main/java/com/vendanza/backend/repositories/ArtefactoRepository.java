package com.vendanza.backend.repositories;
import com.vendanza.backend.models.Artefacto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ArtefactoRepository extends JpaRepository<Artefacto, Integer> {
    List<Artefacto> findByDisponibilidade(String disponibilidade);
}