package com.vendanza.backend.models;

import jakarta.persistence.*;

@Entity
@Table(name = "estudio") // Confirma se no SQL é 'estudio' ou 'estudios'
public class Estudio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estudio")
    private Integer idEstudio;

    @Column(name = "tamanho") // Ou 'descricao', depende do teu SQL
    private String tamanho;

    @Column(name = "alocacao") // Ou 'descricao', depende do teu SQL
    private Integer alocacao;

    public Estudio() {}

    public Estudio(Integer idEstudio, String tamanho, Integer alocacao) {
        this.idEstudio = idEstudio;
        this.tamanho = tamanho;
        this.alocacao = alocacao;
    }

    // Getters e Setters
    public Integer getIdEstudio() {
        return idEstudio;
    }

    public void setIdEstudio(Integer idEstudio) {
        this.idEstudio = idEstudio;
    }

    public String getTamanho() {
        return tamanho;
    }

    public void setTamanho(String tamanho) {
        this.tamanho = tamanho;
    }

    public Integer getAlocacao() {
        return alocacao;
    }

    public void setAlocacao(Integer alocacao) {
        this.alocacao = alocacao;
    }
}