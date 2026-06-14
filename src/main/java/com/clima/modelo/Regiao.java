package com.clima.modelo;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "regioes")
public class Regiao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_regiao")
    private Long idRegiao;

    @Column(name = "nome_regiao", nullable = false, length = 100)
    private String nomeRegiao;

    @Column(name = "estado_provincia", length = 100)
    private String estadoProvincia;

    @Column(nullable = false, length = 100)
    private String pais;

    @Column(precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(precision = 9, scale = 6)
    private BigDecimal longitude;

    public Regiao() {
    }

    public Regiao(String nomeRegiao, String estadoProvincia, String pais, BigDecimal latitude, BigDecimal longitude) {
        this.nomeRegiao = nomeRegiao;
        this.estadoProvincia = estadoProvincia;
        this.pais = pais;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public Long getIdRegiao() {
        return idRegiao;
    }

    public void setIdRegiao(Long idRegiao) {
        this.idRegiao = idRegiao;
    }

    public String getNomeRegiao() {
        return nomeRegiao;
    }

    public void setNomeRegiao(String nomeRegiao) {
        this.nomeRegiao = nomeRegiao;
    }

    public String getEstadoProvincia() {
        return estadoProvincia;
    }

    public void setEstadoProvincia(String estadoProvincia) {
        this.estadoProvincia = estadoProvincia;
    }

    public String getPais() {
        return pais;
    }

    public void setPais(String pais) {
        this.pais = pais;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }
}
