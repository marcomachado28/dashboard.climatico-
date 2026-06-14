package com.clima;

import com.clima.modelo.Clima;
import com.clima.servico.ClimaServico;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class ClimaServicoTest {

    @Autowired
    private ClimaServico climaServico;

    @Test
    public void testBuscarClimaReal() {
        try {
            Clima clima = climaServico.buscarClima("Brasilia");
            assertNotNull(clima);
            assertEquals("Brasília", clima.getCidade());
            assertTrue(clima.getTemperatura() > -50 && clima.getTemperatura() < 60, "Temperatura deve ser razoável");
            assertTrue(clima.getUmidade() >= 0 && clima.getUmidade() <= 100, "Umidade deve ser entre 0 e 100");
            assertNotNull(clima.getDescricao());
        } catch (Exception e) {
            fail("Falha ao buscar clima de Brasília: " + e.getMessage());
        }
    }
}
