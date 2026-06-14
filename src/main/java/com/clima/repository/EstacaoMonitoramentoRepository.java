package com.clima.repository;

import com.clima.modelo.EstacaoMonitoramento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EstacaoMonitoramentoRepository extends JpaRepository<EstacaoMonitoramento, Long> {
    List<EstacaoMonitoramento> findByRegiaoIdRegiao(Long idRegiao);
}
