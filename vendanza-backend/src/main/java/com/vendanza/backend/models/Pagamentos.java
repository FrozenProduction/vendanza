package com.vendanza.backend.models;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "pagamentos")
public class Pagamentos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pagamento")
    private Integer id;

    @Column(name = "tipo_pagamento")
    private Integer tipoPagamento; // Na tua BD: 1=Mensalidade, 2=Artefacto, 3=Coaching

    @Column(name = "id_enceducacao")
    private Integer idEncEducacao;

    @Column(name = "id_aluguer")
    private Integer idAluguer;

    private Integer valor;
    private LocalDate data;

    // --- GETTERS E SETTERS ---
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getTipoPagamento() { return tipoPagamento; }
    public void setTipoPagamento(Integer tipoPagamento) { this.tipoPagamento = tipoPagamento; }

    public Integer getIdEncEducacao() { return idEncEducacao; }
    public void setIdEncEducacao(Integer idEncEducacao) { this.idEncEducacao = idEncEducacao; }

    public Integer getIdAluguer() { return idAluguer; }
    public void setIdAluguer(Integer idAluguer) { this.idAluguer = idAluguer; }

    public Integer getValor() { return valor; }
    public void setValor(Integer valor) { this.valor = valor; }

    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }
}