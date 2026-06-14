public Clima(String cidade, double temperatura, int umidade, String descricao) {        
        this.cidade = cidade;
        this.temperatura = temperatura;
        this.umidade = umidade;
        this.descricao = descricao;
    }

    public String getCidade() { return cidade; }
    public double getTemperatura() { return temperatura; }
    public int getUmidade() { return umidade; }
    public String getDescricao() { return descricao; }

    @Override
    public String toString() {
        return String.format(
            "📊 DASHBOARD CLIMÁTICO: %s\n" +
            "🌡️ Temperatura: %.1f°C\n" + 
            "💧 Umidade: %d%%\n" + 
            "☁️ Condição: %s",
            cidade, temperatura, umidade, descricao
        );
    }
}
