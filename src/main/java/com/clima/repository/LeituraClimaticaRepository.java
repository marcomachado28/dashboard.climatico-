package com.clima.repository;

import com.clima.modelo.LeituraClimatica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeituraClimaticaRepository extends JpaRepository<LeituraClimatica, Long> {
    List<LeituraClimatica> findTop50ByOrderByDataHoraLeituraDesc();
    List<LeituraClimatica> findBySensorIdSensorOrderByDataHoraLeituraDesc(Long idSensor);
}
