package com.vendanza.backend.models;

import java.time.LocalTime;
import jakarta.persistence.*;

@Entity
@Table(name = "horario")
public class Horario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_horario") 
    private Integer idHorario;

    @ManyToOne
    @JoinColumn(name = "id_modalidade", referencedColumnName = "id_modalidade")
    private Modalidade modalidade;

    @Column(name = "dia_semana") 
    private String diaSemana;

    @Column(name = "hora_inicio") 
    private LocalTime horaInicio;

    @Column(name = "hora_fim") 
    private LocalTime horaFim;

    @Column(name = "id_estudio") 
    private Integer idEstudio;

    @Column(name = "id_docente") 
    private Integer idDocente;

    public Horario() {}

    public Horario(Integer idHorario, Modalidade modalidade, String diaSemana, LocalTime horaInicio, LocalTime horaFim, Integer idEstudio) {
        this.idHorario = idHorario;
        this.modalidade = modalidade;
        this.diaSemana = diaSemana;
        this.horaInicio = horaInicio;
        this.horaFim = horaFim;
        this.idEstudio = idEstudio;
    }

    //#region GET SET 

    public Integer getIdHorario() {
        return idHorario;
    }

    public void setIdHorario(Integer idHorario) {
        this.idHorario = idHorario;
    }

    public Modalidade getModalidade() {
        return modalidade;
    }

    public void setModalidade(Modalidade modalidade) {
        this.modalidade = modalidade;
    }

    public String getDiaSemana() {
        return diaSemana;
    }

    public void setDiaSemana(String diaSemana) {
        this.diaSemana = diaSemana;
    }

    public LocalTime getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(LocalTime horaInicio) {
        this.horaInicio = horaInicio;
    }

    public LocalTime getHoraFim() {
        return horaFim;
    }

    public void setHoraFim(LocalTime horaFim) {
        this.horaFim = horaFim;
    }

    public Integer getIdEstudio() {
        return idEstudio;
    }

    public void setIdEstudio(Integer idEstudio) {
        this.idEstudio = idEstudio;
    }

    public Integer getIdDocente() { return idDocente; }
    public void setIdDocente(Integer idDocente) { this.idDocente = idDocente; }
    //#endregion

}
