package com.clima.servico;

import com.clima.controller.ClimaController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.logging.Logger;

@Component
public class ClimaScheduler {

    private static final Logger LOGGER = Logger.getLogger(ClimaScheduler.class.getName());

    @Autowired
    private ClimaController climaController;

    // Sincroniza o clima das principais cidades do mundo a cada 10 minutos (600.000 ms)
    @Scheduled(fixedRate = 600000, initialDelay = 10000)
    public void sincronizarCidadesMundiais() {
        LOGGER.info("Iniciando sincronização automática de cidades mundiais...");
        
        String[] cidades = {
            "Brasília", "São Paulo", "New York", "London", 
            "Tokyo", "Paris", "Sydney", "Cairo", "Lisboa"
        };

        for (String cidade : cidades) {
            try {
                climaController.sincronizarClima(cidade);
                LOGGER.info("Sincronizado clima para: " + cidade);
                // Pequeno atraso para evitar limites na API e respeitar as boas práticas
                Thread.sleep(1500); 
            } catch (Exception e) {
                LOGGER.warning("Erro ao sincronizar clima de " + cidade + ": " + e.getMessage());
            }
        }
        
        LOGGER.info("Sincronização automática de cidades mundiais concluída com sucesso.");
    }
}
