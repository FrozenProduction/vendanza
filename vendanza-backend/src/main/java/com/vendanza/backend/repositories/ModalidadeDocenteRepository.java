package com.vendanza.backend.repositories;

import com.vendanza.backend.models.ModalidadeDocente;
import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;
import java.util.List;

public interface ModalidadeDocenteRepository extends JpaRepository<ModalidadeDocente, Integer> {
    // Procura todas as atribuições de uma modalidade específica
    List<ModalidadeDocente> findByModalidade_IdModalidade(Integer idModalidade);
}
