# 🌍 Dashboard Climático - Monitoramento Ambiental & Emissões
**Autor:** Marco Túlio de Sousa Machado  
**Instituição:** Bootcamp II — Entrega Final (Etapa 3)

---

## 📌 1. Visão Geral do Projeto

Este repositório contém a entrega final da Etapa 3 do Bootcamp. O projeto evoluiu de uma aplicação de console simples em Java para um sistema completo e integrado de monitoramento ambiental e controle de emissões industriais de ponta a ponta. 

A solução proposta coleta dados meteorológicos em tempo real por meio da **OpenWeather API**, processa esses dados através de um ecossistema construído em **Java com Spring Boot**, persiste e relaciona as informações em um banco de dados relacional em nuvem (**Neon PostgreSQL**) e disponibiliza painéis de análise visual interativos em um front-end otimizado hospedado na **Vercel**.

---

## 🛠️ 2. A Stack de Tecnologia (Linguagens e Frameworks)

O projeto é uma aplicação **Full-Stack** (composta por Front-end e Back-end) e adota as seguintes tecnologias:

### **Back-end (Servidor)**
*   **Java 21 (LTS):** A linguagem principal de programação no back-end. A versão 21 garante recursos modernos de concorrência e desempenho.
*   **Spring Boot 3.2.4:** Um framework Java que agiliza o desenvolvimento web. Ele nos fornece o servidor web embutido (Tomcat), a infraestrutura para criar APIs REST e a integração com o banco de dados.
*   **Spring Data JPA / Hibernate:** Uma camada que faz a tradução automática entre as tabelas SQL do banco de dados e os objetos Java (Classes). Graças a ele, não precisamos digitar códigos SQL manuais para inserir, atualizar ou ler registros.
*   **Gson (da Google):** Biblioteca Java usada para converter texto JSON (recebido da OpenWeather API) em objetos legíveis pelo Java.
*   **H2 Database (em memória):** Um banco de dados super leve que roda na memória RAM do computador durante a execução dos testes automatizados (`mvn test`). Ele garante que os testes passem no GitHub Actions sem precisar se conectar a um banco real na nuvem.

### **Front-end (Interface Visual)**
*   **HTML5 & CSS3:** Definem a estrutura semântica da página e a estilização visual. O CSS foi totalmente baseado em **cores sólidas e design plano (Flat Design)**, inspirado na imagem de referência corporativa (evitando excesso de degradês ou efeitos flutuantes para garantir um tom sério e acadêmico).
*   **JavaScript (ES6):** Manipula o navegador do usuário, captura os cliques nos botões, envia requisições assíncronas para o servidor Java (via `fetch`) e atualiza o visual da tela em tempo real sem precisar atualizar a página.
*   **Chart.js:** Uma biblioteca JavaScript para renderização de gráficos. Ela gera os gráficos de linha (histórico de leituras) e de barra (emissão de CO₂ por região) no painel.

---

## 🔗 3. Como Tudo se Conecta (O Fluxo de Dados)

Tudo funciona de forma integrada por meio de requisições HTTP e do padrão REST. Veja o caminho de uma requisição de ponta a ponta:

1.  **O Usuário digita "Brasília"** no dashboard no navegador e clica em **Sincronizar**.
2.  **O JavaScript (Front-end)** faz uma chamada de rede em segundo plano para o servidor Java rodando localmente (ou na nuvem):
    ```
    POST http://localhost:8080/api/clima/sincronizar?cidade=Brasília
    ```
3.  **O Back-end (Spring Boot)** recebe a requisição através do `ClimaController` e a redireciona para o `ClimaServico`.
4.  **Integração Externa:** O Java faz uma chamada de API externa para a **OpenWeather API**, pedindo os dados climáticos em tempo real de Brasília.
5.  **A OpenWeather** responde ao Java com um JSON estruturado contendo a temperatura atual, umidade e a descrição do clima.
6.  **Persistência (Neon PostgreSQL):** O Java analisa esse JSON e realiza as seguintes operações no banco de dados na nuvem (Neon) usando JPA:
    *   Verifica se a região "Brasília" já existe no banco. Se não existir, cria a linha na tabela `regioes`.
    *   Verifica se já existe uma estação de monitoramento padrão para Brasília. Se não, cria na tabela `estacoes_monitoramento`.
    *   Garante que os sensores de "Temperatura" e "Umidade" estão cadastrados na tabela `sensores`.
    *   Insere a leitura de temperatura atual (Ex: `22.5°C`) e a leitura de umidade (Ex: `60%`) na tabela factual `leituras_climaticas`, gravando também o dia e hora exatos.
7.  **Resposta:** O Java retorna os dados meteorológicos de volta para o navegador em formato JSON.
8.  **Renderização:** O JavaScript no navegador recebe o JSON, atualiza os cards de métricas na tela e recarrega os gráficos do **Chart.js**, plotando as novas leituras instantaneamente!

---

## 💾 4. Modelagem Relacional do Banco de Dados (Neon.tech)

O **Neon** é um serviço moderno de banco de dados serverless hospedado na nuvem que roda o motor **PostgreSQL**.
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

## 🚀 5. O papel da Vercel (Hospedagem Front-end)

A **Vercel** é uma plataforma focada em hospedar aplicações front-end e páginas estáticas de alta performance de forma simples.
*   **Integração Contínua (Git-Trigger):** A Vercel está diretamente atrelada ao seu repositório GitHub. Toda vez que enviamos código (`git push`), a Vercel detecta a mudança e recompila a página instantaneamente.
*   **Hospedagem Estática:** A Vercel serve os arquivos `index.html`, `style.css` e `app.js` globalmente para qualquer usuário que acessar a URL do seu site.
*   **A Engrenagem de Conexão:** Como a Vercel hospeda apenas a interface gráfica e o Java (servidor) roda em outro ambiente, criamos um painel de configuração dinâmico no topo do site (o botão de engrenagem <i class="fa-solid fa-gear"></i>). 
    *   Você pode digitar o endereço do seu backend Java rodando localmente (`http://localhost:8080`) ou colar o link de produção do seu backend hospedado no Railway/Render. O JavaScript grava essa informação no `localStorage` do navegador para que o site saiba para onde enviar as requisições.

---

## ⚡ 6. Como Executar e Configurar o Projeto Localmente

### Pré-requisitos
*   Java JDK 21 instalado no seu sistema.
*   IDE recomendada: VS Code ou IntelliJ IDEA.

### Executando o Back-end
1.  Verifique se o arquivo `application.properties` está atualizado com as credenciais do seu Neon DB ou envie-as via variáveis de ambiente.
2.  Importe o projeto como um projeto Maven na sua IDE de preferência.
3.  Execute a classe `Main.java` clicando no botão **Run** ou execute o comando Maven no terminal:
    ```bash
    mvn spring-boot:run
    ```

### Executando o Front-end
1.  Como o frontend é uma página estática interativa que consome a API REST, basta abrir o arquivo `index.html` diretamente no seu navegador ou utilizar a extensão **Live Server** (VS Code).
2.  No painel superior direito do dashboard, clique no ícone de engrenagem (<i class="fa-solid fa-gear"></i>) e certifique-se de que a URL está definida para `http://localhost:8080`.
3.  Digite o nome de uma cidade (Ex: Brasília) no campo de busca e clique em **Sincronizar**.

---

## 🧪 7. Testes Automatizados (CI)

A esteira de integração contínua (GitHub Actions) está configurada para compilar a aplicação e rodar os testes a cada commit ou Pull Request. Os testes foram implementados com **MockMvc** e banco de dados **H2 em memória**, garantindo estabilidade e velocidade.

Para rodar os testes localmente:
```bash
mvn clean test
```

---

## 🎓 8. Aprendizados e Reflexões Acadêmicas obtidos nesta Lição

O desenvolvimento desta entrega final proporcionou aprendizados práticos cruciais para a formação de um engenheiro de software:

1.  **Code Review e Trabalho em Equipe:** Colaborar no mesmo repositório utilizando Pull Requests (PRs) destacou a importância de manter códigos bem estruturados e limpos. A revisão cuidadosa garante que a alteração de um membro do time não quebre a funcionalidade do outro.
2.  **Migração da Memória para o Banco de Dados Real:** A transição de dados mantidos temporariamente em memória para a persistência física relacional em nuvem trouxe à tona discussões sobre relacionamentos de chaves estrangeiras, consistência de dados e a importância do mapeamento ORM (JPA/Hibernate) para agilizar o desenvolvimento.
3.  **Integração Contínua (CI):** A implementação de pipelines com o GitHub Actions automatizou a compilação do código e o disparo de suites de testes a cada push. O aprendizado chave aqui foi a separação de ambientes de desenvolvimento/teste (usando H2) e produção (PostgreSQL), garantindo builds consistentes e livres de dependências externas.
4.  **Desenvolvimento Full-Stack Integrado:** A coordenação entre chamadas REST assíncronas do front-end com os controladores Spring Boot e a integração com APIs externas solidificou o entendimento sobre arquiteturas web modernas e o tratamento correto de requisições Cross-Origin (CORS).
5.  **A Estética da Simplicidade no Design:** A experiência prática de design de interfaces ensinou que dashboards corporativos e acadêmicos exigem layout plano, limpo e com foco absoluto na informação útil. Cores sólidas bem contrastadas e componentes retangulares planos comunicam profissionalismo e otimizam a legibilidade para os tomadores de decisão.
