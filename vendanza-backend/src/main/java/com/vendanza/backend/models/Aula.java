package com.vendanza.backend.models;

import java.time.LocalTime;
import jakarta.persistence.*;

@Entity
@Table(name = "aulas")
public class Aula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_aula")
    private Integer idAula;

    @Column(name = "id_modalidade")
    private Integer idModalidade;

    // Relacionamento com TipoAula
    @ManyToOne
    @JoinColumn(name = "cod_tipoaula", referencedColumnName = "cod_tipoaula")
    private TipoAula tipoAula;

    @Column(name = "id_estudio")
    private Integer idEstudio;

    @Column(name = "hora_inicio")
    private LocalTime horaInicio;

    @Column(name = "hora_fim")
    private LocalTime horaFim;

    @Column(name = "id_aulaprivada")
    private Integer idAulaPrivada;

    @Column(name = "id_horario")
    private Integer idHorario;

    @Column(name = "data_aula")
    private java.time.LocalDate dataAula;

    public Aula() {}

    // Getters e Setters
    public Integer getIdAula() { return idAula; }
    public void setIdAula(Integer idAula) { this.idAula = idAula; }
    public Integer getIdModalidade() { return idModalidade; }
    public void setIdModalidade(Integer idModalidade) { this.idModalidade = idModalidade; }
    public TipoAula getTipoAula() { return tipoAula; }
    public void setTipoAula(TipoAula tipoAula) { this.tipoAula = tipoAula; }
    public Integer getIdEstudio() { return idEstudio; }
    public void setIdEstudio(Integer idEstudio) { this.idEstudio = idEstudio; }
    public LocalTime getHoraInicio() { return horaInicio; }
    public void setHoraInicio(LocalTime horaInicio) { this.horaInicio = horaInicio; }
    public LocalTime getHoraFim() { return horaFim; }
    public void setHoraFim(LocalTime horaFim) { this.horaFim = horaFim; }
    public Integer getIdAulaPrivada() { return idAulaPrivada; }
    public void setIdAulaPrivada(Integer idAulaPrivada) { this.idAulaPrivada = idAulaPrivada; }
    public Integer getIdHorario() { return idHorario; }
    public void setIdHorario(Integer idHorario) { this.idHorario = idHorario; }
    public java.time.LocalDate getDataAula() { return dataAula; }
    public void setDataAula(java.time.LocalDate dataAula) { this.dataAula = dataAula; }
}