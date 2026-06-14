# 🌍 Dashboard Climático - Sistema de Monitoramento Ambiental

Este repositório contém o desenvolvimento completo de um **Dashboard Climático**, uma solução Full-Stack projetada para coletar, armazenar, processar e visualizar dados ambientais críticos. O sistema monitora variáveis meteorológicas e analisa o impacto de poluentes industriais em diferentes regiões.

A arquitetura do projeto é dividida em três pilares:
1. **Banco de Dados (SQL):** Modelagem relacional robusta para histórico de leituras e geolocalização.
2. **Back-end (Java):** Camada de inteligência responsável pela conexão com o banco (JDBC/JPA), processamento de regras de negócio e API de dados.
3. **Front-end (Dashboard):** Interface gráfica para visualização de gráficos e insights climáticos em tempo real.

---

## 📌 Sumário
- [Arquitetura do Sistema](#-arquitetura-do-sistema)
- [Estrutura do Banco de Dados (SQL)](#-estrutura-do-banco-de-dados-sql)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Configuração do Ambiente](#-configuração-do-ambiente)
- [Exemplo de Código Java (Camada de Dados)](#-exemplo-de-código-java-camada-de-dados)
- [Queries e Análises do Dashboard](#-queries-e-análises-do-dashboard)
- [Como Contribuir](#-como-contribuir)

---

## 📐 Arquitetura do Sistema

O fluxo de dados do ecossistema segue a estrutura:
`Sensores Ambientais` ➔ `Banco de Dados SQL` ➔ `Aplicação Java (API)` ➔ `Dashboard Visual`

O banco de dados armazena as informações estruturadas em 5 entidades principais: **Regiões**, **Estações de Monitoramento**, **Sensores**, **Leituras Climáticas** (Tabela Factual) e **Fontes de Emissão**.

---

## 🛠️ Tecnologias Utilizadas
Linguagem Principal: Java 21

Framework Back-end: Spring Boot (Spring Data JPA / Spring Web)

Banco de Dados: PostgreSQL / MySQL

Gerenciador de Dependências: Maven / Gradle

Interface do Dashboard: (Ex: React.js, Thymeleaf ou ferramentas de BI como PowerBI/Metabase conectados à API Java)

## 🚀 Configuração do Ambiente
Pré-requisitos
Java JDK 17 ou superior instalado.

SGBD (PostgreSQL ou MySQL) ativo.

IDE de sua preferência (IntelliJ IDEA, Eclipse ou VS Code).

## Configurando o Banco de Dados
Crie um banco de dados chamado projeto_climatico e execute o script contido na seção Estrutura do Banco de Dados.

## Configurando a Aplicação Java
No arquivo src/main/resources/application.properties do seu projeto Spring Boot, ajuste as credenciais de acesso ao banco:

# 🌍 Sistema de Monitorização Climática e Emissões

Este projeto é uma aplicação Java (Spring Boot) desenvolvida para a monitorização de estações climatéricas, leitura de sensores e controlo de fontes de emissão regionais. A infraestrutura foi desenhada seguindo práticas modernas de DevOps, contando com banco de dados na nuvem, testes automatizados (CI) e deploy contínuo (CD).

---

## 🏗️ 1. Arquitetura da Infraestrutura

O ecossistema da aplicação está dividido em três pilares principais:
1. **Base de Dados (Neon.tech):** Instância PostgreSQL na nuvem que armazena os dados operacionais.
2. **Integração Contínua (GitHub Actions):** Validação automatizada do código a cada `git push`.
3. **Deploy Contínuo (Railway.app):** A aplicação é compilada via `Dockerfile` e publicada automaticamente, gerando um link público.

## 🛠️ Configuração do Banco de Dados na Nuvem (Neon)

Este projeto utiliza o **PostgreSQL** hospedado na nuvem através do **Neon** para rodar os testes de integração automatizados no GitHub Actions.

## 📁 Estrutura do Banco de Dados
Para recriar a estrutura correta do banco, execute o script SQL abaixo dentro do **SQL Editor** no painel do Neon:

```sql

CREATE TABLE regioes (
    id_regiao SERIAL PRIMARY KEY,
    nome_regiao VARCHAR(100) NOT NULL,
    estado_provincia VARCHAR(100),
    pais VARCHAR(100) NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6)
);

CREATE TABLE estacoes_monitoramento (
    id_estacao SERIAL PRIMARY KEY,
    nome_estacao VARCHAR(100) NOT NULL,
    id_regiao INT REFERENCES regioes(id_regiao) ON DELETE CASCADE,
    data_instalacao DATE,
    status_operacional VARCHAR(20) DEFAULT 'Ativa'
);

CREATE TABLE sensores (
    id_sensor SERIAL PRIMARY KEY,
    id_estacao INT REFERENCES estacoes_monitoramento(id_estacao) ON DELETE CASCADE,
    tipo_sensor VARCHAR(50) NOT NULL, 
    unidade_medida VARCHAR(20) NOT NULL 
);

CREATE TABLE leituras_climaticas (
    id_leitura BIGSERIAL PRIMARY KEY,
    id_sensor INT REFERENCES sensores(id_sensor) ON DELETE CASCADE,
    data_hora_leitura TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valor_medido DECIMAL(10,2) NOT NULL
);

CREATE TABLE fontes_emissao (
    id_fonte SERIAL PRIMARY KEY,
    id_regiao INT REFERENCES regioes(id_regiao) ON DELETE SET NULL,
    nome_empresa_local VARCHAR(150),
    tipo_poluente VARCHAR(50),
    emissao_anual_estimada DECIMAL(12,2) -- Em Toneladas
);

```

## 🚀 Passos Finais: Conexão Java e Ativação do CI/CD

Com o banco de dados criado e os segredos salvos no GitHub, siga estes passos para conectar o projeto e rodar a esteira de testes automáticos.

### 1. Configuração do Ambiente Java (`application.properties`)
Certifique-se de que o arquivo `src/main/resources/application.properties` (ou o equivalente na pasta `src/test/resources/`) esteja configurado para ler dinamicamente as variáveis que o GitHub Actions injetará em memória:

```properties
# Conexão dinâmica com o PostgreSQL (Neon)
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}

# Driver e Dialeto do Banco
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=validate

