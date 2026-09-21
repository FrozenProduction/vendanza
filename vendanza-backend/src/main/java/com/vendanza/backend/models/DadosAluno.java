package com.vendanza.backend.models;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "dados_aluno")
public class DadosAluno {

    @Id
    @Column(name = "id_enceducacao")
    private Integer idEncEducacao;

    @OneToOne
    @JoinColumn(name = "id_enceducacao", insertable = false, updatable = false)
    private Utilizador utilizador; // Este nome tem de ser 'utilizador' para bater com o JS
    

    @Column(name = "nomealuno") private String nomeAluno;
    @Column(name = "apelidoaluno") private String apelidoAluno;
    @Column(name = "nomeenceducacao") private String nomeEncEducacao;
    @Column(name = "apelidoenceducacao") private String apelidoEncEducacao;
    @Column(name = "telefone") private String telefone;
    @Column(name = "datanascimento") private LocalDate dataNascimento;
    @Column(name = "iban") private String iban;
    @Column(name = "nif") private String nif;
    @Column(name = "cp") private String cp;

    public DadosAluno() {}

    // Getters e Setters
    public Integer getIdEncEducacao() { return idEncEducacao; }
    public void setIdEncEducacao(Integer idEncEducacao) { this.idEncEducacao = idEncEducacao; }
    public String getNomeAluno() { return nomeAluno; }
    public void setNomeAluno(String nomeAluno) { this.nomeAluno = nomeAluno; }
    public String getApelidoAluno() { return apelidoAluno; }
    public void setApelidoAluno(String apelidoAluno) { this.apelidoAluno = apelidoAluno; }
    public String getNomeEncEducacao() { return nomeEncEducacao; }
    public void setNomeEncEducacao(String nomeEncEducacao) { this.nomeEncEducacao = nomeEncEducacao; }
    public String getApelidoEncEducacao() { return apelidoEncEducacao; }
    public void setApelidoEncEducacao(String apelidoEncEducacao) { this.apelidoEncEducacao = apelidoEncEducacao; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }
    public String getIban() { return iban; }
    public void setIban(String iban) { this.iban = iban; }
    public String getNif() { return nif; }
    public void setNif(String nif) { this.nif = nif; }
    public String getCp() { return cp; }
    public void setCp(String cp) { this.cp = cp; }

}