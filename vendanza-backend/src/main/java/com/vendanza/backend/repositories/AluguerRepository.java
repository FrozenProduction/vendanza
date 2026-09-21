package com.vendanza.backend.repositories;

import com.vendanza.backend.models.Aluguer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface AluguerRepository extends JpaRepository<Aluguer, Integer> {
    List<Aluguer> findByIdEncEducacao(Integer idEncEducacao);
    List<Aluguer> findByEstado(String estado);
    List<Aluguer> findByIdArtefacto(Integer idArtefacto);
    List<Aluguer> findByIdArtefactoAndEstado(Integer idArtefacto, String estado);
    List<Aluguer> findByEstadoIn(List<String> estados);

    @Query("""
        SELECT a FROM Aluguer a
        WHERE LOWER(TRIM(a.estado)) LIKE '%aguardar%'
          AND LOWER(TRIM(a.estado)) LIKE '%aprova%'
        """)
    List<Aluguer> findPedidosAguardandoAprovacao();
}
