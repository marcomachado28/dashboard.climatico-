package com.clima.controller;

import com.clima.modelo.*;
import com.clima.repository.*;
import com.clima.servico.ClimaServico;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ClimaController {

    @Autowired
    private RegiaoRepository regiaoRepository;

    @Autowired
    private EstacaoMonitoramentoRepository estacaoRepository;

    @Autowired
    private SensorRepository sensorRepository;

    @Autowired
    private LeituraClimaticaRepository leituraRepository;

    @Autowired
    private FonteEmissaoRepository fonteEmissaoRepository;

    @Autowired
    private ClimaServico climaServico;

    // --- REGIOES ---
    @GetMapping("/regioes")
    public List<Regiao> listarRegioes() {
        return regiaoRepository.findAll();
    }

    @PostMapping("/regioes")
    public Regiao criarRegiao(@RequestBody Regiao regiao) {
        return regiaoRepository.save(regiao);
    }

    // --- ESTACOES ---
    @GetMapping("/estacoes")
    public List<EstacaoMonitoramento> listarEstacoes() {
        return estacaoRepository.findAll();
    }

    @PostMapping("/estacoes")
    public ResponseEntity<?> criarEstacao(@RequestBody EstacaoMonitoramento estacao) {
        if (estacao.getRegiao() == null || estacao.getRegiao().getIdRegiao() == null) {
            return ResponseEntity.badRequest().body("Região associada é obrigatória.");
        }
        Optional<Regiao> regiaoOpt = regiaoRepository.findById(estacao.getRegiao().getIdRegiao());
        if (regiaoOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Região não encontrada.");
        }
        estacao.setRegiao(regiaoOpt.get());
        if (estacao.getDataInstalacao() == null) {
            estacao.setDataInstalacao(LocalDate.now());
        }
        return ResponseEntity.ok(estacaoRepository.save(estacao));
    }

    // --- SENSORES ---
    @GetMapping("/sensores")
    public List<Sensor> listarSensores() {
        return sensorRepository.findAll();
    }

    @PostMapping("/sensores")
    public ResponseEntity<?> criarSensor(@RequestBody Sensor sensor) {
        if (sensor.getEstacao() == null || sensor.getEstacao().getIdEstacao() == null) {
            return ResponseEntity.badRequest().body("Estação associada é obrigatória.");
        }
        Optional<EstacaoMonitoramento> estacaoOpt = estacaoRepository.findById(sensor.getEstacao().getIdEstacao());
        if (estacaoOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Estação não encontrada.");
        }
        sensor.setEstacao(estacaoOpt.get());
        return ResponseEntity.ok(sensorRepository.save(sensor));
    }

    // --- LEITURAS ---
    @GetMapping("/leituras")
    public List<LeituraClimatica> listarLeituras() {
        return leituraRepository.findTop50ByOrderByDataHoraLeituraDesc();
    }

    @PostMapping("/leituras")
    public ResponseEntity<?> criarLeitura(@RequestBody LeituraClimatica leitura) {
        if (leitura.getSensor() == null || leitura.getSensor().getIdSensor() == null) {
            return ResponseEntity.badRequest().body("Sensor associado é obrigatório.");
        }
        Optional<Sensor> sensorOpt = sensorRepository.findById(leitura.getSensor().getIdSensor());
        if (sensorOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Sensor não encontrado.");
        }
        leitura.setSensor(sensorOpt.get());
        if (leitura.getDataHoraLeitura() == null) {
            leitura.setDataHoraLeitura(LocalDateTime.now());
        }
        return ResponseEntity.ok(leituraRepository.save(leitura));
    }

    // --- FONTES DE EMISSAO ---
    @GetMapping("/emissoes")
    public List<FonteEmissao> listarEmissoes() {
        return fonteEmissaoRepository.findAll();
    }

    @PostMapping("/emissoes")
    public ResponseEntity<?> criarEmissao(@RequestBody FonteEmissao fonte) {
        if (fonte.getRegiao() == null || fonte.getRegiao().getIdRegiao() == null) {
            return ResponseEntity.badRequest().body("Região associada é obrigatória.");
        }
        Optional<Regiao> regiaoOpt = regiaoRepository.findById(fonte.getRegiao().getIdRegiao());
        if (regiaoOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Região não encontrada.");
        }
        fonte.setRegiao(regiaoOpt.get());
        return ResponseEntity.ok(fonteEmissaoRepository.save(fonte));
    }

    // --- SINCRONIZAR CLIMA (OPENWEATHER + DATABASE) ---
    @PostMapping("/clima/sincronizar")
    public ResponseEntity<?> sincronizarClima(@RequestParam String cidade) {
        try {
            Clima clima = climaServico.buscarClima(cidade);

            // 1. Buscar ou Criar Região
            Regiao regiao = regiaoRepository.findByNomeRegiaoIgnoreCase(clima.getCidade())
                    .orElseGet(() -> {
                        Regiao novaRegiao = new Regiao();
                        novaRegiao.setNomeRegiao(clima.getCidade());
                        novaRegiao.setPais("BR");
                        novaRegiao.setEstadoProvincia("");
                        novaRegiao.setLatitude(BigDecimal.ZERO);
                        novaRegiao.setLongitude(BigDecimal.ZERO);
                        return regiaoRepository.save(novaRegiao);
                    });

            // 2. Buscar ou Criar Estação
            List<EstacaoMonitoramento> estacoes = estacaoRepository.findByRegiaoIdRegiao(regiao.getIdRegiao());
            EstacaoMonitoramento estacao;
            if (estacoes.isEmpty()) {
                EstacaoMonitoramento novaEstacao = new EstacaoMonitoramento();
                novaEstacao.setNomeEstacao("Estação " + regiao.getNomeRegiao());
                novaEstacao.setRegiao(regiao);
                novaEstacao.setDataInstalacao(LocalDate.now());
                novaEstacao.setStatusOperacional("Ativa");
                estacao = estacaoRepository.save(novaEstacao);
            } else {
                estacao = estacoes.get(0);
            }

            // 3. Buscar ou Criar Sensor de Temperatura
            List<Sensor> sensoresTemp = sensorRepository.findByEstacaoIdEstacaoAndTipoSensorIgnoreCase(estacao.getIdEstacao(), "Temperatura");
            Sensor sensorTemp;
            if (sensoresTemp.isEmpty()) {
                Sensor novoSensor = new Sensor();
                novoSensor.setEstacao(estacao);
                novoSensor.setTipoSensor("Temperatura");
                novoSensor.setUnidadeMedida("°C");
                sensorTemp = sensorRepository.save(novoSensor);
            } else {
                sensorTemp = sensoresTemp.get(0);
            }

            // 4. Buscar ou Criar Sensor de Umidade
            List<Sensor> sensoresUmidade = sensorRepository.findByEstacaoIdEstacaoAndTipoSensorIgnoreCase(estacao.getIdEstacao(), "Umidade");
            Sensor sensorUmidade;
            if (sensoresUmidade.isEmpty()) {
                Sensor novoSensor = new Sensor();
                novoSensor.setEstacao(estacao);
                novoSensor.setTipoSensor("Umidade");
                novoSensor.setUnidadeMedida("%");
                sensorUmidade = sensorRepository.save(novoSensor);
            } else {
                sensorUmidade = sensoresUmidade.get(0);
            }

            // 5. Gravar Leitura de Temperatura
            LeituraClimatica leituraTemp = new LeituraClimatica();
            leituraTemp.setSensor(sensorTemp);
            leituraTemp.setValorMedido(BigDecimal.valueOf(clima.getTemperatura()));
            leituraTemp.setDataHoraLeitura(LocalDateTime.now());
            leituraRepository.save(leituraTemp);

            // 6. Gravar Leitura de Umidade
            LeituraClimatica leituraUmidade = new LeituraClimatica();
            leituraUmidade.setSensor(sensorUmidade);
            leituraUmidade.setValorMedido(BigDecimal.valueOf(clima.getUmidade()));
            leituraUmidade.setDataHoraLeitura(LocalDateTime.now());
            leituraRepository.save(leituraUmidade);

            return ResponseEntity.ok(clima);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao sincronizar clima: " + e.getMessage());
        }
    }
}
