package com.vendanza.backend.models;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

//import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "dados_docente")
public class DadosDocente {

    @Id
    @Column(name = "id_docente")
    private Integer idDocente;

    //NOVO
    // A ligação à tabela phpauth_users
   /* @OneToOne
    //@MapsId // Faz com que o idDocente seja o mesmo que o id do Utilizador
    @JoinColumn(name = "id_docente")
    // Evita loop infinito no JSON se o Utilizador também referenciar o Docente
    @JsonIgnoreProperties({"dadosDocente", "password"}) 
    private Utilizador utilizador;//FIM NOVO*/

    @Column(name = "nome") private String nome;
    @Column(name = "apelido") private String apelido;
    @Column(name = "telefone") private String telefone;
    @Column(name = "datanascimento") private LocalDate dataNascimento;
    @Column(name = "morada") private String morada;
    @Column(name = "iban") private String iban;
    @Column(name = "nif") private String nif;
    @Column(name = "tipo_coach") private String tipoCoach;


    //CUIDADO
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "modalidade_docente",
        joinColumns = @JoinColumn(name = "id_docente"),
        inverseJoinColumns = @JoinColumn(name = "id_modalidade")
    )
    @JsonIgnoreProperties({"horarios", "inscricoes", "artefactos"}) // Bloqueia loops infinitos no JSON
    private List<Modalidade> modalidades;

    public DadosDocente() {}

    // Getters e Setters
    public Integer getIdDocente() { return idDocente; }
    public void setIdDocente(Integer idDocente) { this.idDocente = idDocente; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getApelido() { return apelido; }
    public void setApelido(String apelido) { this.apelido = apelido; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }
    public String getMorada() { return morada; }
    public void setMorada(String morada) { this.morada = morada; }
    public String getIban() { return iban; }
    public void setIban(String iban) { this.iban = iban; }
    public String getNif() { return nif; }
    public void setNif(String nif) { this.nif = nif; }
    public String getTipoCoach() { return tipoCoach; }
    public void setTipoCoach(String tipoCoach) { this.tipoCoach = tipoCoach; }

    //CUIDADO
    public List<Modalidade> getModalidades() { 
        return modalidades; 
    }
    
    public void setModalidades(List<Modalidade> modalidades) { 
        this.modalidades = modalidades; 
    }
    
}