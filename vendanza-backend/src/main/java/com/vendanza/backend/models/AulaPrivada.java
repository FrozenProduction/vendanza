package com.vendanza.backend.models;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "\"aulasprivadas\"")
public class AulaPrivada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_aulaprivada")
    private Integer idAulaPrivada;

    @ManyToOne
    @JoinColumn(name = "id_modalidade")
    @JsonIgnoreProperties({"inscricoes", "aulas"})
    private Modalidade modalidade;

    @ManyToOne
    @JoinColumn(name = "id_estudio")
    @JsonIgnoreProperties({"inscricoes", "aulas"})
    private Estudio estudio;

    @Column(name = "dia")
    private LocalDate dia;

    @Column(name = "hora_inicio")
    private LocalTime horaInicio;

    @Column(name = "hora_fim")
    private LocalTime horaFim;

    @Column(name = "estado")
    private String estado;

    @Column(name = "preco")
    private Float preco;

    @Column(name = "duracao")
    private Integer duracao;

    // === A MAGIA DOS DUPLOS (Mantém o repositório do teu amigo vivo e dá-te os nomes!) ===

    // 1. Tipo Aula
    @Column(name = "cod_tipoaula")
    private Integer cod_tipoaula; // Para gravar (Obrigatório)

    @ManyToOne
    @JoinColumn(name = "cod_tipoaula", insertable = false, updatable = false)
    private TipoAula tipoAula; // Só de Leitura (Para o teu JS ler o nome)

    // 2. Docente
    @Column(name = "id_docente")
    private Integer idDocente; // O código do teu amigo usa isto!

    @ManyToOne
    @JoinColumn(name = "id_docente", insertable = false, updatable = false)
    @JsonIgnoreProperties({"aulas", "presencas"})
    private DadosDocente docente; // Só de Leitura (Para o teu JS ler o nome)

    // 3. Encarregado
    @Column(name = "id_enceducacao")
    private Integer idEncEducacao; // Para gravar

    @ManyToOne
    @JoinColumn(name = "id_enceducacao", insertable = false, updatable = false)
    @JsonIgnoreProperties({"aulas", "presencas"})
    private DadosAluno encEducacao; // Só de Leitura (Para o teu JS ler o nome)

    public AulaPrivada() {}

    // --- GETTERS E SETTERS GERAIS ---
    public Integer getIdAulaPrivada() { return idAulaPrivada; }
    public void setIdAulaPrivada(Integer idAulaPrivada) { this.idAulaPrivada = idAulaPrivada; }

    public Modalidade getModalidade() { return modalidade; }
    public void setModalidade(Modalidade modalidade) { this.modalidade = modalidade; }

    public Estudio getEstudio() { return estudio; }
    public void setEstudio(Estudio estudio) { this.estudio = estudio; }

    public LocalDate getDia() { return dia; }
    public void setDia(LocalDate dia) { this.dia = dia; }

    public LocalTime getHoraInicio() { return horaInicio; }
    public void setHoraInicio(LocalTime horaInicio) { this.horaInicio = horaInicio; }

    public LocalTime getHoraFim() { return horaFim; }
    public void setHoraFim(LocalTime horaFim) { this.horaFim = horaFim; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Float getPreco() { return preco; }
    public void setPreco(Float preco) { this.preco = preco; }

    public Integer getDuracao() { return duracao; }
    public void setDuracao(Integer duracao) { this.duracao = duracao; }

    // --- GETTERS/SETTERS P/ GRAVAR (Usados pelo Controller e pelo teu amigo) ---
    public Integer getCod_tipoaula() { return cod_tipoaula; }
    public void setCod_tipoaula(Integer cod_tipoaula) { this.cod_tipoaula = cod_tipoaula; }

    public Integer getIdDocente() { return idDocente; }
    public void setIdDocente(Integer idDocente) { this.idDocente = idDocente; }

    public Integer getIdEncEducacao() { return idEncEducacao; }
    public void setIdEncEducacao(Integer idEncEducacao) { this.idEncEducacao = idEncEducacao; }

    // --- GETTERS/SETTERS P/ LER (Usados pelo JSON no JS para mostrar os nomes) ---
    public TipoAula getTipoAula() { return tipoAula; }
    public void setTipoAula(TipoAula tipoAula) { this.tipoAula = tipoAula; }

    public DadosDocente getDocente() { return docente; }
    public void setDocente(DadosDocente docente) { this.docente = docente; }

    public DadosAluno getEncEducacao() { return encEducacao; }
    public void setEncEducacao(DadosAluno encEducacao) { this.encEducacao = encEducacao; }
}