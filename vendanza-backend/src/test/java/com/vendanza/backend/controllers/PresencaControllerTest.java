package com.vendanza.backend.controllers;

import com.vendanza.backend.models.Presencas;
import com.vendanza.backend.repositories.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PresencaControllerTest {

    // 1. Fazer Mock do Repositório que vamos fingir
    @Mock
    private PresencasRepository presencasRepository;

    // Fazer Mock das restantes dependências do teu Controller para ele não dar erro ao iniciar
    @Mock private AulaRepository aulaRepository;
    @Mock private HorarioRepository horarioRepository;
    @Mock private TipoAulaRepository tipoAulaRepository;
    @Mock private DadosAlunoRepository alunoRepository;
    @Mock private DadosDocenteRepository docenteRepository;

    // 2. Injetar os Mocks no Controller Real
    @InjectMocks
    private PresencaController presencaController;

    @Test
    public void naoDevePermitirRegistarPresencaDuplicadaParaMesmoAlunoEAula() {
        // --- ARRANGE (Preparação) ---
        Integer idEncarregadoTest = 10;
        Integer idHorarioTest = 5;
        String dataAulaTest = LocalDate.now().toString();

        // Simulamos exatamente o formato JSON/Map que o teu Frontend envia no fetch()
        Map<String, Object> payload = new HashMap<>();
        payload.put("idHorario", idHorarioTest);
        payload.put("dataAula", dataAulaTest);
        payload.put("estado", "Presente");
        payload.put("idEncarregado", idEncarregadoTest);

        // REGRA DE OURO: Quando o teu Controller usar este método para verificar duplicados, 
        // o Mock vai responder "SIM, encontrei uma presença!".
        when(presencasRepository.findByEncarregadoIdEncEducacaoAndAulaIdHorarioAndAulaDataAula(
                eq(idEncarregadoTest), 
                eq(idHorarioTest), 
                any(LocalDate.class)
        )).thenReturn(Optional.of(new Presencas()));

        // --- ACT (Ação) ---
        // Acionamos a função real do teu Controller
        ResponseEntity<?> resposta = presencaController.marcarPresenca(payload);

        // --- ASSERT (Verificações) ---
        // 1. O HTTP Code TEM de ser 400 (Bad Request), que é o que tu definiste na tua linha: return ResponseEntity.status(400)
        assertEquals(HttpStatus.BAD_REQUEST, resposta.getStatusCode(), 
            "O sistema devia rejeitar a presença com o erro 400 (Bad Request) porque a presença já existe.");
        
        // 2. A prova final: Garantir que a função .save() NUNCA é chamada.
        // Isto blinda o teu sistema, impedindo que a base de dados fique cheia de lixo.
        verify(presencasRepository, never()).save(any(Presencas.class));
    }
}