public class Main {
    public static void main(String[] args) {
        ClimaServico servico = new ClimaServico();

        try {
        
            Clima clima = servico.buscarClima("Brasília");

            System.out.println("\n=== PREVISÃO DO TEMPO ===");
            System.out.println("Cidade: " + clima.getCidade());
            System.out.println("Temperatura: " + clima.getTemperatura() + "°C");
            System.out.println("Umidade: " + clima.getUmidade() + "%");
            System.out.println("Condição: " + clima.getDescricao());
            System.out.println("=========================\n");

        } catch (Exception e) {
            System.err.println("Erro ao buscar o clima: " + e.getMessage());
        }
    }
}
