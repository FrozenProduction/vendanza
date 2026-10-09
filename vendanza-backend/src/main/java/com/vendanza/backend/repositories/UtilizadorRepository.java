package com.vendanza.backend.repositories;

import com.vendanza.backend.models.Utilizador;
import org.springframework.data.jpa.repository.JpaRepository; 
import java.util.Optional;

// Mudámos aqui a última palavra para Integer
public interface UtilizadorRepository extends JpaRepository<Utilizador, Integer> {
    Optional<Utilizador> findFirstByEmail(String email);
}