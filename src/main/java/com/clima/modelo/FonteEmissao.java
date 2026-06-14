package com.clima.modelo;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "fontes_emissao")
public class FonteEmissao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_fonte")
    private Long idFonte;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_regiao", referencedColumnName = "id_regiao")
    private Regiao regiao;

    @Column(name = "nome_empresa_local", length = 150)
    private String nomeEmpresaLocal;

    @Column(name = "tipo_poluente", length = 50)
    private String tipoPoluente;

    @Column(name = "emissao_anual_estimada", precision = 12, scale = 2)
    private BigDecimal emissaoAnualEstimada;

    public FonteEmissao() {
    }

    public FonteEmissao(Regiao regiao, String nomeEmpresaLocal, String tipoPoluente, BigDecimal emissaoAnualEstimada) {
        this.regiao = regiao;
        this.nomeEmpresaLocal = nomeEmpresaLocal;
        this.tipoPoluente = tipoPoluente;
        this.emissaoAnualEstimada = emissaoAnualEstimada;
    }

    public Long getIdFonte() {
        return idFonte;
    }

    public void setIdFonte(Long idFonte) {
        this.idFonte = idFonte;
    }

    public Regiao getRegiao() {
        return regiao;
    }

    public void setRegiao(Regiao regiao) {
        this.regiao = regiao;
    }

    public String getNomeEmpresaLocal() {
        return nomeEmpresaLocal;
    }

    public void setNomeEmpresaLocal(String nomeEmpresaLocal) {
        this.nomeEmpresaLocal = nomeEmpresaLocal;
    }

    public String getTipoPoluente() {
        return tipoPoluente;
    }

    public void setTipoPoluente(String tipoPoluente) {
        this.tipoPoluente = tipoPoluente;
    }

    public BigDecimal getEmissaoAnualEstimada() {
        return emissaoAnualEstimada;
    }

    public void setEmissaoAnualEstimada(BigDecimal emissaoAnualEstimada) {
        this.emissaoAnualEstimada = emissaoAnualEstimada;
    }
}
