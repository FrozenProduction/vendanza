package com.vendanza.backend.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "inscricoes")
public class Inscricoes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_inscricao")
    private Integer idInscricao;

    @ManyToOne
    @JoinColumn(name = "id_enceducacao")
    @JsonIgnoreProperties({"inscricoes", "utilizador", "morada"})
    private DadosAluno encarregado;

    @ManyToOne
    @JoinColumn(name = "id_modalidade")
    @JsonIgnoreProperties({"inscricoes"})
    private Modalidade modalidade;

    public Inscricoes() {}

    // Getters e Setters
    public Integer getIdInscricao() { return idInscricao; }
    public void setIdInscricao(Integer idInscricao) { this.idInscricao = idInscricao; }

    public DadosAluno getEncarregado() { return encarregado; }
    public void setEncarregado(DadosAluno encarregado) { this.encarregado = encarregado; }

    public Modalidade getModalidade() { return modalidade; }
    public void setModalidade(Modalidade modalidade) { this.modalidade = modalidade; }
}