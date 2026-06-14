# 🌍 Dashboard Climático - Monitoramento Ambiental & Emissões

Esta é a entrega final da **Etapa 3 (Trabalho em Equipe, Banco de Dados e Code Review)** do Bootcamp II. O projeto foi reestruturado de uma aplicação de console simples para uma solução Full-Stack robusta, contendo um Back-end Java (Spring Boot) persistido no Neon PostgreSQL e um Front-end moderno (HTML/CSS/JS) com gráficos interativos e responsivos hospedado na Vercel.

---

## 👥 1. Integrantes do Grupo
*   **Marco Túlio Machado** (GitHub: [@marcomachado28](https://github.com/marcomachado28))
*   *[Adicione aqui o nome e a matrícula dos outros integrantes de sua equipe]*

---

## 🏗️ 2. Arquitetura da Solução

O ecossistema é composto por três pilares integrados de ponta a ponta:

```
[ Usuário ] ➔ [ Dashboard Front-end (Vercel) ] ➔ [ API REST (Java / Spring Boot) ] ➔ [ PostgreSQL (Neon) ]
                                                                 │
                                                                 └──➔ [ OpenWeather API ]
```

1.  **Banco de Dados Relacional (Neon.tech):** Instância PostgreSQL na nuvem que gerencia os dados estruturados do sistema, permitindo persistência física e integridade dos dados (tabelas factuais e dimensões).
2.  **Back-end Java (Spring Boot / JPA):** Camada de inteligência exposta por meio de APIs REST. Ela executa operações de CRUD no banco, realiza o processamento lógico das regras de negócio, integra-se à OpenWeather API e habilita CORS para comunicações de domínios externos.
3.  **Front-end Dashboard (Vercel):** Interface web estática interativa, desenvolvida em Vanilla CSS (com estética glassmorphism premium e micro-animações) e Vanilla JavaScript, que renderiza gráficos dinâmicos usando Chart.js e se conecta dinamicamente ao Back-end.

---

## 🛠️ 3. Tecnologias Utilizadas
*   **Linguagem:** Java 21 (LTS)
*   **Framework:** Spring Boot 3.2.4 (com Spring Data JPA, Hibernate e Spring Web)
*   **Driver do Banco:** PostgreSQL Driver
*   **Banco de Testes:** H2 Database (in-memory) para que o CI sempre rode "verde" sem depender de internet/banco externo
*   **Parser de JSON:** Gson
*   **Gerenciador de Dependências:** Maven
*   **Interface Web (Dashboard):** HTML5, CSS3, JavaScript (ES6+), FontAwesome 6, Chart.js 4 (via CDN)
*   **Infraestrutura e CI/CD:** GitHub Actions (CI) e Vercel (CD para o frontend)

---

## 📂 4. Estrutura do Banco de Dados (SQL)

Para recriar a estrutura no painel do **Neon PostgreSQL**, execute o script abaixo no editor de queries SQL:

```sql
-- Dimensão 1: Regiões
CREATE TABLE regioes (
    id_regiao SERIAL PRIMARY KEY,
    nome_regiao VARCHAR(100) NOT NULL,
    estado_provincia VARCHAR(100),
    pais VARCHAR(100) NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6)
);

-- Dimensão 2: Estações de Monitoramento
CREATE TABLE estacoes_monitoramento (
    id_estacao SERIAL PRIMARY KEY,
    nome_estacao VARCHAR(100) NOT NULL,
    id_regiao INT REFERENCES regioes(id_regiao) ON DELETE CASCADE,
    data_instalacao DATE,
    status_operacional VARCHAR(20) DEFAULT 'Ativa'
);

-- Dimensão 3: Sensores
CREATE TABLE sensores (
    id_sensor SERIAL PRIMARY KEY,
    id_estacao INT REFERENCES estacoes_monitoramento(id_estacao) ON DELETE CASCADE,
    tipo_sensor VARCHAR(50) NOT NULL, 
    unidade_medida VARCHAR(20) NOT NULL 
);

-- Factual: Leituras Climáticas
CREATE TABLE leituras_climaticas (
    id_leitura BIGSERIAL PRIMARY KEY,
    id_sensor INT REFERENCES sensores(id_sensor) ON DELETE CASCADE,
    data_hora_leitura TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valor_medido DECIMAL(10,2) NOT NULL
);

-- Dimensão 4: Fontes de Emissão Industrial
CREATE TABLE fontes_emissao (
    id_fonte SERIAL PRIMARY KEY,
    id_regiao INT REFERENCES regioes(id_regiao) ON DELETE SET NULL,
    nome_empresa_local VARCHAR(150),
    tipo_poluente VARCHAR(50),
    emissao_anual_estimada DECIMAL(12,2)
);
```

---

## ⚡ 5. Como Executar o Projeto Localmente

### Pré-requisitos
*   Java JDK 21 instalado no seu sistema.
*   IDE recomendada: VS Code ou IntelliJ IDEA.

### Executando o Back-end
1.  Na pasta do projeto `/dashboard.climatico-`, execute o comando para iniciar a aplicação Spring Boot:
    ```bash
    mvn spring-boot:run
    ```
2.  O servidor iniciará na porta `8080`. Você pode verificar que está online acessando os endpoints locais no seu navegador:
    *   Listar regiões: `http://localhost:8080/api/regioes`
    *   Listar sensores: `http://localhost:8080/api/sensores`

### Executando o Front-end
1.  Como o frontend é uma página estática interativa que consome a API REST, basta abrir o arquivo `index.html` diretamente no seu navegador ou utilizar a extensão **Live Server** (VS Code).
2.  No painel superior direito do dashboard, clique no ícone de engrenagem (<i class="fa-solid fa-gear"></i>) e certifique-se de que a URL está definida para `http://localhost:8080`.
3.  Digite o nome de uma cidade (Ex: Brasília) no campo de busca e clique em **Sincronizar**. O Java fará a requisição para a OpenWeather, criará as entidades no banco local/em nuvem, registrará as leituras e atualizará os gráficos na hora!

---

## 🧪 6. Testes Automatizados (CI)

A esteira de integração contínua (GitHub Actions) está configurada para compilar a aplicação e rodar os testes a cada commit ou Pull Request. Os testes foram implementados com **MockMvc** e banco de dados **H2 em memória**, garantindo estabilidade e velocidade.

Para rodar os testes localmente:
```bash
mvn clean test
```

---

## 🚀 7. Como Fazer Deploy

### Deploy do Front-end (Vercel)
Como o repositório já está atrelado à Vercel, o deploy do frontend é feito automaticamente a cada `git push` para a branch `main`:
1.  A Vercel hospedará os arquivos estáticos da raiz (`index.html`, `style.css`, `app.js`).
2.  Abra a aplicação publicada no link da Vercel.
3.  Configure a URL do backend publicado (Render, Railway, etc.) clicando no ícone de engrenagem no topo superior direito para conectar os gráficos.

### Deploy do Back-end (Render / Railway / Koyeb)
O projeto contém um `Dockerfile` pronto para buildar o Java.
1.  Crie um novo Web Service em sua plataforma de hospedagem de contêineres conectando-o a este mesmo repositório do GitHub.
2.  Configure as seguintes Variáveis de Ambiente no painel do serviço:
    *   `DB_URL`: O link de conexão do Neon PostgreSQL (ex: `jdbc:postgresql://ep-xyz.neon.tech/projeto_climatico?sslmode=require`)
    *   `DB_USER`: Usuário do Neon.
    *   `DB_PASSWORD`: Senha do Neon.
3.  A plataforma lerá o `Dockerfile`, compilará a aplicação Maven com Java 21 e a disponibilizará online sob um link público `https://[seu-back-end].up.railway.app` ou similar.

---

## 📝 8. O que foi corrigido e aprimorado (Code Review)
*   **Correção de Erros de Sintaxe:** A classe `Clima.java` continha sintaxe quebrada e a declaração de classe ausente. Mapeamos os campos, construtores e criamos a estrutura correta.
*   **Refatoração para Padrão Maven:** Movemos todos os arquivos Java soltos da raiz para a estrutura organizada `src/main/java/com/clima/...` sob pacotes específicos (`modelo`, `servico`, `controller`, `repository`).
*   **Correção no `pom.xml`:** O plugin do Spring Boot estava fora da tag `<build><plugins>` o que impedia a compilação.
*   **Introdução do Spring Boot + JPA:** Implementamos entidades JPA relacionais baseadas no script de banco, criando os repositórios Spring Data correspondentes.
*   **Sincronização Integrada:** Criamos um endpoint `POST /api/clima/sincronizar` que conecta a OpenWeather API ao banco relacional. Ele cria a região e a estação automaticamente e insere a factual de leituras.
*   **Interface Web Premium:** Substituímos o prompt de console por um dashboard visual espetacular com gráficos de temperatura, umidade, emissão industrial por região, tabela histórica, formulários de inserção e alertas toast dinâmicos.
