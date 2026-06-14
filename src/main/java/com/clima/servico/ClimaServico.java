package com.clima.servico;

import com.clima.modelo.Clima;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Service
public class ClimaServico {
    
    private static final String API_KEY = "67e042f57f0fde4c1d51473209a47847"; 
    private static final String BASE_URL = "https://api.openweathermap.org/data/2.5/weather?q=%s&appid=%s&units=metric&lang=pt_br";

    public Clima buscarClima(String nomeCidade) throws Exception {
        String cidadeFormatada = URLEncoder.encode(nomeCidade, StandardCharsets.UTF_8);
        String urlFinal = String.format(BASE_URL, cidadeFormatada, API_KEY);

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(urlFinal))
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            return mapearJsonParaObjeto(response.body());
        } else if (response.statusCode() == 404) {
            throw new RuntimeException("Cidade não encontrada no OpenWeather. Verifique o nome.");
        } else {
            throw new RuntimeException("Erro ao conectar com o serviço de clima. Status: " + response.statusCode());
        }
    }

    private Clima mapearJsonParaObjeto(String jsonDados) {
        JsonObject json = JsonParser.parseString(jsonDados).getAsJsonObject();
        
        String nomeCidade = json.get("name").getAsString();
        
        JsonObject main = json.getAsJsonObject("main");
        double temp = main.get("temp").getAsDouble();
        int umidade = main.get("humidity").getAsInt();
        
        JsonObject weather = json.getAsJsonArray("weather").get(0).getAsJsonObject();
        String descricao = weather.get("description").getAsString();

        return new Clima(nomeCidade, temp, umidade, descricao);
    }
}
