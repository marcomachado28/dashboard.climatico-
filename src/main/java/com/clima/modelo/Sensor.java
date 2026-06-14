package com.clima.modelo;

import jakarta.persistence.*;

@Entity
@Table(name = "sensores")
public class Sensor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sensor")
    private Long idSensor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_estacao", referencedColumnName = "id_estacao")
    private EstacaoMonitoramento estacao;

    @Column(name = "tipo_sensor", nullable = false, length = 50)
    private String tipoSensor;

    @Column(name = "unidade_medida", nullable = false, length = 20)
    private String unidadeMedida;

    public Sensor() {
    }

    public Sensor(EstacaoMonitoramento estacao, String tipoSensor, String unidadeMedida) {
        this.estacao = estacao;
        this.tipoSensor = tipoSensor;
        this.unidadeMedida = unidadeMedida;
    }

    public Long getIdSensor() {
        return idSensor;
    }

    public void setIdSensor(Long idSensor) {
        this.idSensor = idSensor;
    }

    public EstacaoMonitoramento getEstacao() {
        return estacao;
    }

    public void setEstacao(EstacaoMonitoramento estacao) {
        this.estacao = estacao;
    }

    public String getTipoSensor() {
        return tipoSensor;
    }

    public void setTipoSensor(String tipoSensor) {
        this.tipoSensor = tipoSensor;
    }

    public String getUnidadeMedida() {
        return unidadeMedida;
    }

    public void setUnidadeMedida(String unidadeMedida) {
        this.unidadeMedida = unidadeMedida;
    }
}
