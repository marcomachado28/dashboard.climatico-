package com.clima.repository;

import com.clima.modelo.Sensor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SensorRepository extends JpaRepository<Sensor, Long> {
    List<Sensor> findByEstacaoIdEstacao(Long idEstacao);
    List<Sensor> findByEstacaoIdEstacaoAndTipoSensorIgnoreCase(Long idEstacao, String tipoSensor);
}
