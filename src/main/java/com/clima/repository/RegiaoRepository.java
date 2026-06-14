package com.clima.repository;

import com.clima.modelo.Regiao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RegiaoRepository extends JpaRepository<Regiao, Long> {
    Optional<Regiao> findByNomeRegiaoIgnoreCase(String nomeRegiao);
}
