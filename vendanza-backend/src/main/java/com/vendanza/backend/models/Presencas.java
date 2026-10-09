package com.vendanza.backend.models;

import jakarta.persistence.*;

@Entity
@Table(name = "presencas")
public class Presencas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_presenca")
    private Integer idPresenca;

    @ManyToOne
    @JoinColumn(name = "id_docente")
    private DadosDocente docente;

    @ManyToOne
    @JoinColumn(name = "id_enceducacao")
    private DadosAluno encarregado;

    @ManyToOne
    @JoinColumn(name = "id_aula")
    private Aula aula;
    
    @Column(name = "estado")
    private String estado;

    public Presencas() {}

    // Getters e Setters
    public Integer getIdPresenca() { return idPresenca; }
    public void setIdPresenca(Integer idPresenca) { this.idPresenca = idPresenca; }

    public DadosDocente getDocente() { return docente; }
    public void setDocente(DadosDocente docente) { this.docente = docente; }

    public DadosAluno getEncarregado() { return encarregado; }
    public void setEncarregado(DadosAluno encarregado) { this.encarregado = encarregado; }

    public Aula getAula() { return aula; }
    public void setAula(Aula aula) { this.aula = aula; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}