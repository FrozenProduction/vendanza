package com.vendanza.backend.controllers;

import com.vendanza.backend.models.*;
import com.vendanza.backend.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/verificar")
@CrossOrigin(origins = "*")
public class VerificadorController {

    @Autowired private AulaPrivadaRepository aulaPrivadaRepository;
    @Autowired private HorarioRepository horarioRepository;
    @Autowired private AulaRepository aulaRepository;
    @Autowired private TipoAulaRepository tipoAulaRepository;

    @GetMapping("/aulas-realizadas")
    public ResponseEntity<?> verificarAulasRealizadas() {
        LocalDateTime agora = LocalDateTime.now();

        // 1. Processar Aulas Privadas
        List<AulaPrivada> privadas = aulaPrivadaRepository.findAll();
        for (AulaPrivada ap : privadas) {
            LocalDateTime dataHoraAulaComeco = LocalDateTime.of(ap.getDia(), ap.getHoraInicio());
            LocalDateTime dataHoraAulaFim = dataHoraAulaComeco.plusMinutes(ap.getDuracao() != null ? ap.getDuracao() : 60);
            
            // Regra A: Se a aula acabou e estava Agendada, passa a Concluída (Aguarda aluno)
            if ("Agendada".equals(ap.getEstado()) && agora.isAfter(dataHoraAulaFim)) {
                ap.setEstado("Concluída");
                aulaPrivadaRepository.save(ap);
            }

            // Regra B: Se passaram 48h de uma aula Concluída (e o aluno não confirmou), passa a Falta
            boolean passed48h = dataHoraAulaFim.plusHours(48).isBefore(agora);
            if ("Concluída".equals(ap.getEstado()) && passed48h) {
                ap.setEstado("Falta");
                aulaPrivadaRepository.save(ap);
            }

            // Regra C: Se o estado for Realizada ou Falta (fechada), deve estar na tabela 'aulas'
            if ("Realizada".equals(ap.getEstado()) || "Falta".equals(ap.getEstado())) {
                criarRegistoAulaSeNaoExistir(ap);
            }
        }

        // 2. Processar Horários (Aulas Recorrentes) para os últimos 14 dias
        List<Horario> horarios = horarioRepository.findAll();
        for (int i = 0; i <= 14; i++) {
            LocalDate dataAnalisar = agora.toLocalDate().minusDays(i);
            String diaSemanaPT = obterDiaSemanaPT(dataAnalisar.getDayOfWeek().getValue());

            for (Horario h : horarios) {
                if (h.getDiaSemana() != null && h.getDiaSemana().equalsIgnoreCase(diaSemanaPT)) {
                    LocalDateTime dataHoraFim = LocalDateTime.of(dataAnalisar, h.getHoraFim() != null ? h.getHoraFim() : LocalTime.of(0, 0));
                    boolean passed48h = dataHoraFim.plusHours(48).isBefore(agora);

                    if (passed48h) {
                        criarRegistoAulaRecorrenteSeNaoExistir(h, dataAnalisar);
                    }
                }
            }
        }

        return ResponseEntity.ok(Map.of("message", "Verificação de aulas concluída com sucesso."));
    }

    private void criarRegistoAulaSeNaoExistir(AulaPrivada ap) {
        Optional<Aula> aulaOpt = aulaRepository.findByIdAulaPrivada(ap.getIdAulaPrivada());
        if (aulaOpt.isEmpty()) {
            Aula novaAula = new Aula();
            novaAula.setIdModalidade(ap.getModalidade() != null ? ap.getModalidade().getIdModalidade() : 0);
            
            // Garantir que o Tipo de Aula é carregado
            if (ap.getTipoAula() != null) {
                novaAula.setTipoAula(ap.getTipoAula());
            } else if (ap.getCod_tipoaula() != null) {
                tipoAulaRepository.findById(ap.getCod_tipoaula()).ifPresent(novaAula::setTipoAula);
            }
            
            novaAula.setIdEstudio(ap.getEstudio() != null ? ap.getEstudio().getIdEstudio() : 0);
            novaAula.setHoraInicio(ap.getHoraInicio());
            novaAula.setHoraFim(ap.getHoraFim());
            novaAula.setIdAulaPrivada(ap.getIdAulaPrivada());
            novaAula.setDataAula(ap.getDia());
            aulaRepository.save(novaAula);
        }
    }

    private void criarRegistoAulaRecorrenteSeNaoExistir(Horario h, LocalDate data) {
        // Precisamos verificar se a aula já existe para aquele horario e aquela data.
        // O AulaRepository atual precisa de um método para procurar por idHorario e dataAula.
        // Vamos adicionar isso logo a seguir!
        Optional<Aula> aulaOpt = aulaRepository.findByIdHorarioAndDataAula(h.getIdHorario(), data);
        if (aulaOpt.isEmpty()) {
            Aula novaAula = new Aula();
            novaAula.setIdModalidade(h.getModalidade() != null ? h.getModalidade().getIdModalidade() : 0);
            
            // Garantir que Tipo 5 (Regular) existe, senão usar o 1 por defeito
            Optional<TipoAula> tipoRegular = tipoAulaRepository.findById(5);
            if (tipoRegular.isPresent()) {
                novaAula.setTipoAula(tipoRegular.get());
            } else {
                Optional<TipoAula> tipoFallback = tipoAulaRepository.findById(1);
                tipoFallback.ifPresent(novaAula::setTipoAula);
            }
            
            novaAula.setIdHorario(h.getIdHorario());
            novaAula.setIdEstudio(h.getIdEstudio());
            novaAula.setHoraInicio(h.getHoraInicio());
            novaAula.setHoraFim(h.getHoraFim());
            novaAula.setDataAula(data);
            
            aulaRepository.save(novaAula);
        }
    }

    private String obterDiaSemanaPT(int dayOfWeekNumber) {
        switch (dayOfWeekNumber) {
            case 1: return "Segunda-feira";
            case 2: return "Terça-feira";
            case 3: return "Quarta-feira";
            case 4: return "Quinta-feira";
            case 5: return "Sexta-feira";
            case 6: return "Sábado";
            case 7: return "Domingo";
            default: return "";
        }
    }
}
