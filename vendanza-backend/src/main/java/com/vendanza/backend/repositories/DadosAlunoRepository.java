package com.vendanza.backend.repositories;

import com.vendanza.backend.models.DadosAluno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface DadosAlunoRepository extends JpaRepository<DadosAluno, Integer> {

}
