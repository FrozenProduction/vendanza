package com.vendanza.backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
//import java.time.LocalDate;

@Entity
@Table(name = "phpauth_users")
public class Utilizador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String email;
    private String password;

    @Column(name = "isactive")
    private Short isactive = 1;

    private LocalDateTime dt = LocalDateTime.now();

    private String nome;

    @Transient
    private String nif;

    @Transient
    private String telemovel;

    @Column(name = "cod_tipo")
    private Integer tipo;

    @Transient 
    private String dataNascimento;

    private String iban;

    public Utilizador() {}

    // Getters e Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Short getIsactive() { return isactive; }
    public void setIsactive(Short isactive) { this.isactive = isactive; }
    public LocalDateTime getDt() { return dt; }
    public void setDt(LocalDateTime dt) { this.dt = dt; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public Integer getTipo() { return tipo; }
    public void setTipo(Integer tipo) { this.tipo = tipo; }
    public String getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(String dataNascimento) { this.dataNascimento = dataNascimento; }
    public String getNif() {
    return nif;
    }
    public void setNif(String nif) {
    this.nif = nif;
    }
    public String getTelemovel() {
    return telemovel;
    }
    public void setTelemovel(String telemovel) {
    this.telemovel = telemovel;
    }
    public String getIban() { return iban; }
    public void setIban(String iban) { this.iban = iban; }
}