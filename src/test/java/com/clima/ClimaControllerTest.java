package com.clima;

import com.clima.modelo.Regiao;
import com.clima.repository.RegiaoRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class ClimaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private RegiaoRepository regiaoRepository;

    @Test
    public void testListarRegioes() throws Exception {
        regiaoRepository.deleteAll();
        
        Regiao r = new Regiao("Brasilia", "DF", "BR", BigDecimal.valueOf(-15.7938), BigDecimal.valueOf(-47.8827));
        regiaoRepository.save(r);

        mockMvc.perform(get("/api/regioes")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nomeRegiao").value("Brasilia"));
    }

    @Test
    public void testCriarRegiao() throws Exception {
        String regiaoJson = "{\"nomeRegiao\":\"São Paulo\",\"estadoProvincia\":\"SP\",\"pais\":\"BR\",\"latitude\":-23.5505,\"longitude\":-46.6333}";

        mockMvc.perform(post("/api/regioes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(regiaoJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nomeRegiao").value("São Paulo"));
    }
}
