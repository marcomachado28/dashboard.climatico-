# 🌍 Dashboard Climático & Monitoramento de Emissões
**Autor:** Marco Túlio de Sousa Machado  
**Instituição:** Bootcamp II — Entrega Final (Etapa 3)

---

## 📌 1. Visão Geral do Projeto

Este repositório contém a entrega final da Etapa 3 do Bootcamp. O projeto evoluiu de uma aplicação de console simples em Java para um sistema completo e integrado de monitoramento ambiental e controle de emissões industriais de ponta a ponta. 

A solução proposta coleta dados meteorológicos em tempo real por meio da **OpenWeather API**, processa esses dados através de um ecossistema construído em **Java com Spring Boot**, persiste e relaciona as informações em um banco de dados relacional em nuvem (**Neon PostgreSQL**) e disponibiliza painéis de análise visual interativos em um front-end otimizado hospedado na **Vercel**.

---

## 📐 2. Arquitetura da Solução

O fluxo e processamento de dados do sistema foram estruturados com base em três pilares fundamentais:

```
[ Usuário ] ➔ [ Dashboard (Vercel) ] ➔ [ API REST (Spring Boot) ] ➔ [ PostgreSQL (Neon) ]
                                                       │
                                                       └──➔ [ OpenWeather API ]
```

1.  **Back-end (Java 21 & Spring Boot):** Camada de negócio e API REST. Responsável pelas requisições HTTP para a API externa, regras de validação, mapeamento objeto-relacional (JPA) e persistência de dados.
2.  **Banco de Dados (Neon.tech PostgreSQL):** Base de dados relacional hospedada na nuvem que armazena a estrutura factual e as tabelas dimensionais de forma íntegra.
3.  **Front-end (Vercel):** Interface do dashboard simples, limpa e funcional, adaptada de padrões corporativos clássicos, com gráficos de séries temporais e barras usando **Chart.js** e formulários dinâmicos de gerenciamento.

---

## 💾 3. Modelagem Relacional do Banco de Dados

O banco de dados foi modelado para suportar o rastreamento histórico de leituras ambientais vinculadas a sensores em estações geolocalizadas. O script SQL a seguir foi executado no console da Neon:

```sql
-- Dimensão 1: Regiões Geográficas
CREATE TABLE regioes (
    id_regiao SERIAL PRIMARY KEY,
    nome_regiao VARCHAR(100) NOT NULL,
    estado_provincia VARCHAR(100),
    pais VARCHAR(100) NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6)
);

-- Dimensão 2: Estações de Monitoramento instaladas
CREATE TABLE estacoes_monitoramento (
    id_estacao SERIAL PRIMARY KEY,
    nome_estacao VARCHAR(100) NOT NULL,
    id_regiao INT REFERENCES regioes(id_regiao) ON DELETE CASCADE,
    data_instalacao DATE,
    status_operacional VARCHAR(20) DEFAULT 'Ativa'
);

-- Dimensão 3: Sensores acoplados nas estações
CREATE TABLE sensores (
    id_sensor SERIAL PRIMARY KEY,
    id_estacao INT REFERENCES estacoes_monitoramento(id_estacao) ON DELETE CASCADE,
    tipo_sensor VARCHAR(50) NOT NULL, 
    unidade_medida VARCHAR(20) NOT NULL 
);

-- Factual: Histórico de leituras realizadas pelos sensores
CREATE TABLE leituras_climaticas (
    id_leitura BIGSERIAL PRIMARY KEY,
    id_sensor INT REFERENCES sensores(id_sensor) ON DELETE CASCADE,
    data_hora_leitura TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valor_medido DECIMAL(10,2) NOT NULL
);

-- Dimensão 4: Fontes de Emissão Industrial locais
CREATE TABLE fontes_emissao (
    id_fonte SERIAL PRIMARY KEY,
    id_regiao INT REFERENCES regioes(id_regiao) ON DELETE SET NULL,
    nome_empresa_local VARCHAR(150),
    tipo_poluente VARCHAR(50),
    emissao_anual_estimada DECIMAL(12,2)
);
```

---

## 🛠️ 4. Detalhes de Implementação

Durante o desenvolvimento, liderei as seguintes correções e implementações no repositório:
*   **Organização e Correção de Arquivos:** Movi os arquivos soltos na raiz para a arquitetura de pacotes Maven correta (`com.clima`), eliminando o arquivo malformado `projeto clima.java` e corrigindo a declaração do compilador Java no `pom.xml`.
*   **Modelagem de Entidades com JPA:** Criei os mapeamentos declarativos (`@Entity`) e integrei as interfaces do `JpaRepository` para gerenciar as operações de banco sem escrita de SQL manual desnecessária.
*   **Mecanismo de Sincronização Dinâmica:** Desenvolvi um endpoint `/api/clima/sincronizar` que conecta a OpenWeather API ao Neon DB. Ao receber o nome de uma cidade, o Java a insere como Região, gera uma Estação padrão, instala sensores de Temperatura e Umidade e grava as leituras factuais correspondentes.
*   **Design Simples e Funcional:** Desenvolvi um design dark minimalista e responsivo que evita exageros estéticos e foca no contraste e na legibilidade dos dados (tabelas e gráficos clássicos em tons de azul, verde e cinza).
*   **Garantia de Qualidade com Banco H2:** Para evitar que o CI (GitHub Actions) falhasse por falta de credenciais do banco em nuvem, criei configurações locais de teste (`src/test/resources/application.properties`) usando banco em memória H2.

---

## ⚡ 5. Como Executar e Configurar o Projeto

### Rodando o Back-end
1.  Verifique se o arquivo `application.properties` está atualizado com as credenciais do seu Neon DB ou envie-as via variáveis de ambiente.
2.  Importe o projeto como um projeto Maven na sua IDE de preferência.
3.  Execute a classe `Main.java` clicando no botão **Run** ou execute o comando Maven no terminal:
    ```bash
    mvn spring-boot:run
    ```

### Rodando o Front-end
1.  Abra o arquivo `index.html` diretamente no seu navegador.
2.  Certifique-se de que a URL de conexão no painel de engrenagem está apontada para a porta do seu servidor Java local (`http://localhost:8080`).
3.  Utilize o campo de texto para buscar cidades e adicionar registros.

---

## 🎓 6. Aprendizados Obtidos nesta Lição

O desenvolvimento desta entrega final proporcionou aprendizados práticos cruciais para a formação de um engenheiro de software:

1.  **Code Review e Trabalho em Equipe:** Colaborar no mesmo repositório utilizando Pull Requests (PRs) destacou a importância de manter códigos bem estruturados e limpos. A revisão cuidadosa garante que a alteração de um membro do time não quebre a funcionalidade do outro.
2.  **Migração da Memória para o Banco de Dados Real:** A transição de dados mantidos temporariamente em memória para a persistência física relacional em nuvem trouxe à tona discussões sobre relacionamentos de chaves estrangeiras, consistência de dados e a importância do mapeamento ORM (JPA/Hibernate) para agilizar o desenvolvimento.
3.  **Integração Contínua (CI):** A implementação de pipelines com o GitHub Actions automatizou a compilação do código e o disparo de suites de testes a cada push. O aprendizado chave aqui foi a separação de ambientes de desenvolvimento/teste (usando H2) e produção (PostgreSQL), garantindo builds consistentes e livres de dependências externas.
4.  **Desenvolvimento Full-Stack Integrado:** A coordenação entre chamadas REST assíncronas do front-end com os controladores Spring Boot e a integração com APIs externas solidificou o entendimento sobre arquiteturas web modernas e o tratamento correto de requisições Cross-Origin (CORS).
5.  **A Estética da Simplicidade no Design:** A experiência prática de design de interfaces ensinou que dashboards corporativos e acadêmicos exigem layout plano, limpo e com foco absoluto na informação útil. Cores sólidas bem contrastadas e componentes retangulares planos comunicam profissionalismo e otimizam a legibilidade para os tomadores de decisão.
