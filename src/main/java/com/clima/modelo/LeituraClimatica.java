package com.clima.modelo;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "leituras_climaticas")
public class LeituraClimatica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_leitura")
    private Long idLeitura;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_sensor", referencedColumnName = "id_sensor")
    private Sensor sensor;

    @Column(name = "data_hora_leitura", nullable = false)
    private LocalDateTime dataHoraLeitura = LocalDateTime.now();

    @Column(name = "valor_medido", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorMedido;

    public LeituraClimatica() {
    }

    public LeituraClimatica(Sensor sensor, LocalDateTime dataHoraLeitura, BigDecimal valorMedido) {
        this.sensor = sensor;
        this.dataHoraLeitura = dataHoraLeitura;
        this.valorMedido = valorMedido;
    }

    public Long getIdLeitura() {
        return idLeitura;
    }

    public void setIdLeitura(Long idLeitura) {
        this.idLeitura = idLeitura;
    }

    public Sensor getSensor() {
        return sensor;
    }

    public void setSensor(Sensor sensor) {
        this.sensor = sensor;
    }

    public LocalDateTime getDataHoraLeitura() {
        return dataHoraLeitura;
    }

    public void setDataHoraLeitura(LocalDateTime dataHoraLeitura) {
        this.dataHoraLeitura = dataHoraLeitura;
    }

    public BigDecimal getValorMedido() {
        return valorMedido;
    }

    public void setValorMedido(BigDecimal valorMedido) {
        this.valorMedido = valorMedido;
    }
}
