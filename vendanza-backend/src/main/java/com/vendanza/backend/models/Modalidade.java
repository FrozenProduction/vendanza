package com.vendanza.backend.models;

import jakarta.persistence.*;

@Entity
@Table(name = "modalidade")
public class Modalidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_modalidade")
    private Integer idModalidade;

    @Column(name = "descricao")
    private String descricao;

    public Modalidade() {}

    public Modalidade(Integer idModalidade, String descricao) {
        this.idModalidade = idModalidade;
        this.descricao = descricao;
    }

    public Integer getIdModalidade() {
        return idModalidade;
    }

    public void setIdModalidade(Integer idModalidade) {
        this.idModalidade = idModalidade;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }
}
