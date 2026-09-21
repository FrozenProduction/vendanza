package com.vendanza.backend.models;

import jakarta.persistence.*;

@Entity
@Table(name = "dados_direcao")
public class DadosDirecao {

    // Atenção: Aqui não usamos o @GeneratedValue, porque o ID tem de ser o mesmo do phpauth_users!
    @Id
    @Column(name = "id_direcao")
    private Integer idDirecao;

    @Column(name = "nomegestor") private String nomeGestor;
    @Column(name = "apelidogestor") private String apelidoGestor;
    @Column(name = "telefone") private String telefone;
    @Column(name = "nif") private String nif;

    public DadosDirecao() {}

    // Getters e Setters
    public Integer getIdDirecao() { return idDirecao; }
    public void setIdDirecao(Integer idDirecao) { this.idDirecao = idDirecao; }
    public String getNomeGestor() { return nomeGestor; }
    public void setNomeGestor(String nomeGestor) { this.nomeGestor = nomeGestor; }
    public String getApelidoGestor() { return apelidoGestor; }
    public void setApelidoGestor(String apelidoGestor) { this.apelidoGestor = apelidoGestor; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public String getNif() { return nif; }
    public void setNif(String nif) { this.nif = nif; }
}