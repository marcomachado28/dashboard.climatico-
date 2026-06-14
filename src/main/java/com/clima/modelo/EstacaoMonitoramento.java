package com.clima.modelo;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "estacoes_monitoramento")
public class EstacaoMonitoramento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estacao")
    private Long idEstacao;

    @Column(name = "nome_estacao", nullable = false, length = 100)
    private String nomeEstacao;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_regiao", referencedColumnName = "id_regiao")
    private Regiao regiao;

    @Column(name = "data_instalacao")
    private LocalDate dataInstalacao;

    @Column(name = "status_operacional", length = 20)
    private String statusOperacional = "Ativa";

    public EstacaoMonitoramento() {
    }

    public EstacaoMonitoramento(String nomeEstacao, Regiao regiao, LocalDate dataInstalacao, String statusOperacional) {
        this.nomeEstacao = nomeEstacao;
        this.regiao = regiao;
        this.dataInstalacao = dataInstalacao;
        this.statusOperacional = statusOperacional;
    }

    public Long getIdEstacao() {
        return idEstacao;
    }

    public void setIdEstacao(Long idEstacao) {
        this.idEstacao = idEstacao;
    }

    public String getNomeEstacao() {
        return nomeEstacao;
    }

    public void setNomeEstacao(String nomeEstacao) {
        this.nomeEstacao = nomeEstacao;
    }

    public Regiao getRegiao() {
        return regiao;
    }

    public void setRegiao(Regiao regiao) {
        this.regiao = regiao;
    }

    public LocalDate getDataInstalacao() {
        return dataInstalacao;
    }

    public void setDataInstalacao(LocalDate dataInstalacao) {
        this.dataInstalacao = dataInstalacao;
    }

    public String getStatusOperacional() {
        return statusOperacional;
    }

    public void setStatusOperacional(String statusOperacional) {
        this.statusOperacional = statusOperacional;
    }
}
