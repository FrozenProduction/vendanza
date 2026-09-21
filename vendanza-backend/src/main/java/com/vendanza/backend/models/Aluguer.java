package com.vendanza.backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "aluguer")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Aluguer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_aluguer")
    private Integer id;

    @Column(name = "data_inicio")
    private LocalDateTime dataInicio;

    @Column(name = "data_fim")
    private LocalDateTime dataFim;

    private Integer valor;
    
    private String estado; 

    @Column(name = "id_artefacto")
    private Integer idArtefacto;

    @Column(name = "id_enceducacao")
    private Integer idEncEducacao;

    // --- GETTERS E SETTERS ---

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public LocalDateTime getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDateTime dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDateTime getDataFim() {
        return dataFim;
    }

    public void setDataFim(LocalDateTime dataFim) {
        this.dataFim = dataFim;
    }

    public Integer getValor() {
        return valor;
    }

    public void setValor(Integer valor) {
        this.valor = valor;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Integer getIdArtefacto() {
        return idArtefacto;
    }

    public void setIdArtefacto(Integer idArtefacto) {
        this.idArtefacto = idArtefacto;
    }

    public Integer getIdEncEducacao() {
        return idEncEducacao;
    }

    public void setIdEncEducacao(Integer idEncEducacao) {
        this.idEncEducacao = idEncEducacao;
    }
}