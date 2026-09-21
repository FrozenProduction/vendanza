package com.vendanza.backend.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "modalidade_docente")
public class ModalidadeDocente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // Se tiveres uma PK, se não, usa os campos abaixo

    @ManyToOne
    @JoinColumn(name = "id_modalidade")
    @JsonIgnoreProperties("atribuicoes")
    private Modalidade modalidade;

    @ManyToOne
    @JoinColumn(name = "id_docente")
    @JsonIgnoreProperties("modalidades")
    private DadosDocente docente;

    public ModalidadeDocente() {}

    // Getters e Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Modalidade getModalidade() { return modalidade; }
    public void setModalidade(Modalidade modalidade) { this.modalidade = modalidade; }
    public DadosDocente getDocente() { return docente; }
    public void setDocente(DadosDocente docente) { this.docente = docente; }
}