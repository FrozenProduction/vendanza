package com.vendanza.backend.models;

import jakarta.persistence.*;

@Entity
@Table(name = "artefacto")
public class Artefacto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_artefacto")
    private Integer id;

    private String descricao;

    private String categoria;

    private String tamanho;

    private String estado;

    private String telefone;
    
    @Column(name = "preco_aluguer")
    private Integer precoAluguer;
    
    private String disponibilidade;

    @Column(name = "imagem", columnDefinition = "TEXT")
    private String imagem;

    @Column(name = "id_enceducacao")
    private Integer idEncEducacao;

    @Column(name = "id_docente")
    private Integer idDocente;

    @Column(name = "id_direcao")
    private Integer idDirecao;

    // --- GETTERS E SETTERS ---

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getTamanho() {
        return tamanho;
    }

    public void setTamanho(String tamanho) {
        this.tamanho = tamanho;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public void setPrecoAluguer(Integer precoAluguer) {
        this.precoAluguer = precoAluguer;
    }

    public Integer getPrecoAluguer() {
        return precoAluguer;
    }

    public String getDisponibilidade() {
        return disponibilidade;
    }

    public void setDisponibilidade(String disponibilidade) {
        this.disponibilidade = disponibilidade;
    }

    public String getImagem() {
        return imagem;
    }

    public void setImagem(String imagem) {
        this.imagem = imagem;
    }

    public Integer getIdEncEducacao() {
        return idEncEducacao;
    }

    public void setIdEncEducacao(Integer idEncEducacao) {
        this.idEncEducacao = idEncEducacao;
    }

    public Integer getIdDocente() {
        return idDocente;
    }

    public void setIdDocente(Integer idDocente) {
        this.idDocente = idDocente;
    }

    public Integer getIdDirecao() {
        return idDirecao;
    }

    public void setIdDirecao(Integer idDirecao) {
        this.idDirecao = idDirecao;
    }
}