package com.vendanza.backend.models;

import jakarta.persistence.*;

@Entity
@Table(name = "tipo_aula")
public class TipoAula {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cod_tipoaula")
    private Integer codTipoAula;

    @Column(name = "descricao")
    private String descricao;

    public TipoAula() {}

    // Getters e Setters
    public Integer getCodTipoAula() { return codTipoAula; }
    public void setCodTipoAula(Integer codTipoAula) { this.codTipoAula = codTipoAula; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
}