package com.vendanza.backend.controllers;

import com.vendanza.backend.models.AulaPrivada;
import com.vendanza.backend.repositories.AulaPrivadaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AulaPrivadaControllerTest {

    @Mock
    private AulaPrivadaRepository aulaPrivadaRepository;

    @InjectMocks
    private AulaPrivadaController aulaPrivadaController;

    @Test
    public void naoDevePermitirFaturarUmCoachingQueAindaNaoFoiRealizado() {
        // --- ARRANGE (Preparar a Armadilha) ---
        Integer idAulaTarget = 50;
        
        // 1. Simulamos a aula como ela está na Base de Dados agora
        AulaPrivada aulaNaBD = new AulaPrivada();
        aulaNaBD.setIdAulaPrivada(idAulaTarget);
        aulaNaBD.setEstado("Pedido");

        // 2. CORREÇÃO: Criamos um Map para simular exatamente o JSON {"estado": "Pago"} que o frontend envia
        Map<String, String> pedidoDeAtualizacao = new HashMap<>();
        pedidoDeAtualizacao.put("estado", "Pago"); 

        // Ensinamos a BD falsa a devolver a nossa aula quando o Controller a procurar
        when(aulaPrivadaRepository.findById(idAulaTarget)).thenReturn(Optional.of(aulaNaBD));


        // --- ACT (Executar a Ação) ---
        // Agora já passamos o Map corretamente
        ResponseEntity<?> resposta = aulaPrivadaController.atualizarEstado(idAulaTarget, pedidoDeAtualizacao);


        // --- ASSERT (Verificações) ---
        
        // 1ª Verificação: O sistema NÃO PODE devolver 200 OK. Tem de devolver um erro (ex: 400 Bad Request).
        assertEquals(HttpStatus.BAD_REQUEST, resposta.getStatusCode(), 
            "ERRO GRAVE VULNERABILIDADE: O sistema permitiu marcar como 'Pago' um Coaching que está apenas como 'Pedido'!");

        // 2ª Verificação Blindada: O repositório NUNCA pode ter guardado a alteração nesta aula.
        verify(aulaPrivadaRepository, never()).save(any(AulaPrivada.class));
    }
}