package com.vendanza.backend.controllers;

import com.vendanza.backend.models.Artefacto;
import com.vendanza.backend.repositories.AluguerRepository;
import com.vendanza.backend.repositories.ArtefactoRepository;
import com.vendanza.backend.repositories.PagamentosRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class InventarioControllerTest {

    // 1. Mock de todos os repositórios que o teu InventarioController usa
    @Mock private ArtefactoRepository artefactoRepository;
    @Mock private AluguerRepository aluguerRepository;
    @Mock private PagamentosRepository pagamentosRepository;

    // 2. Injetar o Controller real
    @InjectMocks
    private InventarioController inventarioController;

    @Test
    public void naoDevePermitirRegistarArtefactoComPrecoNegativo() {
        // --- 1. ARRANGE (A Armadilha) ---
        Artefacto artefactoInvalido = new Artefacto();
        artefactoInvalido.setDescricao("Tutu de Ballet Clássico");
        artefactoInvalido.setCategoria("Figurino");
        
        // Colocamos propositadamente um preço de aluguer negativo!
        artefactoInvalido.setPrecoAluguer(-15); 

        // --- 2. ACT (Ação) ---
        // Acionamos a função exata que tens no teu InventarioController
        ResponseEntity<?> resposta = inventarioController.adicionarItem(artefactoInvalido);

        // --- 3. ASSERT (Verificação) ---
        // 1º O teste exige que o Controller trave o pedido com um Erro 400 (Bad Request)
        assertEquals(HttpStatus.BAD_REQUEST, resposta.getStatusCode(), 
            "O sistema permitiu guardar um artefacto com preço negativo! Isto tem de ser bloqueado.");
        
        // 2º A prova de que a nossa base de dados está blindada: a função save() NUNCA pode ser executada
        verify(artefactoRepository, never()).save(any(Artefacto.class));
    }
}