package com.clima.modelo;

public class Clima {
    private String cidade;
    private double temperatura;
    private int umidade;
    private String descricao;

    public Clima() {
    }

    public Clima(String cidade, double temperatura, int umidade, String descricao) {
        this.cidade = cidade;
        this.temperatura = temperatura;
        this.umidade = umidade;
        this.descricao = descricao;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public double getTemperatura() {
        return temperatura;
    }

    public void setTemperatura(double temperatura) {
        this.temperatura = temperatura;
    }

    public int getUmidade() {
        return umidade;
    }

    public void setUmidade(int umidade) {
        this.umidade = umidade;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    @Override
    public String toString() {
        return String.format(
                "📊 DASHBOARD CLIMÁTICO: %s%n" +
                "🌡️ Temperatura: %.1f°C%n" +
                "💧 Umidade: %d%%%n" +
                "☁️ Condição: %s",
                cidade, temperatura, umidade, descricao
        );
    }
}
