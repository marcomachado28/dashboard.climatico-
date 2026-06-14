package com.clima.repository;

import com.clima.modelo.FonteEmissao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FonteEmissaoRepository extends JpaRepository<FonteEmissao, Long> {
    List<FonteEmissao> findByRegiaoIdRegiao(Long idRegiao);
}
