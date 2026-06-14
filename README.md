> [!IMPORTANT]
> **Uso de Inteligência Artificial:** Este projeto foi desenvolvido com auxílio de ferramentas de IA (Gemini, Claude, Copilot e ChatGPT) para acelerar criação de código, refatoração e design. Todo o aprendizado sobre Spring Boot, bancos de dados em nuvem e arquitetura full-stack foi assimilado de forma concreta por Marco Túlio e Lucas Cortez.

# 🌍 Dashboard Climático — Monitoramento Ambiental & Emissões

**Autores:** Marco Túlio de Sousa Machado & Lucas Cortez Leoi  
**Instituição:** Bootcamp II — Entrega Final (Etapa 3)

| Ambiente | URL |
|---|---|
| Repositório GitHub | [github.com/marcomachado28/dashboard.climatico-](https://github.com/marcomachado28/dashboard.climatico-) |
| Front-end (Vercel) | [dashboard-climatico-lyart.vercel.app](https://dashboard-climatico-lyart.vercel.app/) |
| Back-end (Render)  | [dashboard-climatico-b0zc.onrender.com](https://dashboard-climatico-b0zc.onrender.com) |

---

## 📌 1. Visão Geral

Sistema completo de monitoramento ambiental e controle de emissões industriais. Coleta dados meteorológicos em tempo real via **OpenWeather API**, processa no **Java/Spring Boot**, persiste no **Neon PostgreSQL** e exibe painéis interativos no front-end hospedado na **Vercel**.

Destaques da versão atual:
- **Atualização automática a cada 30 segundos** — o dashboard sincroniza dados sem interação do usuário.
- **Auto-switch de aba** — ao salvar um registro (ex: Região), a aba correspondente (Regiões) abre automaticamente.
- **Indicador de última atualização** — timestamp exibido ao lado do botão de refresh.
- **Formulários dinâmicos** — o Painel de Cadastro Rápido exibe apenas o formulário do tipo selecionado.
- **Fluxo visual** — guia ilustrativo mostrando a hierarquia: Região ➔ Estação ➔ Sensor ➔ Leitura.
- **Filtro global de região** — todos os cards, gráficos e tabelas filtram pelo mesmo seletor.
- **Totalmente responsivo** — layouts de 320px a 1600px+ com media queries dedicadas.

---

## 🛠️ 2. Stack de Tecnologia

### Back-end
| Tecnologia | Versão | Função |
|---|---|---|
| Java | 21 (LTS) | Linguagem principal |
| Spring Boot | 3.2.4 | Framework web + servidor embutido (Tomcat) |
| Spring Data JPA / Hibernate | — | ORM: mapeamento objetos ↔ tabelas SQL |
| Gson (Google) | 2.10.1 | Parsing do JSON da OpenWeather API |
| PostgreSQL (Neon) | — | Banco de dados relacional em nuvem |
| H2 (em memória) | — | Banco para testes automatizados |

### Front-end
| Tecnologia | Função |
|---|---|
| HTML5 & CSS3 | Estrutura semântica + Dark Flat Design responsivo |
| JavaScript ES6+ | Fetch assíncrono, lógica de UI, atualização em tempo real |
| Chart.js | Gráficos de linha (leituras) e barra (emissões) |
| FontAwesome 6 | Ícones |
| Google Fonts (Inter) | Tipografia |

---

## 🔗 3. Fluxo de Dados — Ponta a Ponta

```
Usuário digita "Brasília" ──► POST /api/clima/sincronizar?cidade=Brasília
                                        │
                                  ClimaController
                                        │
                                  ClimaServico ──► GET OpenWeather API
                                        │
                              Neon PostgreSQL (JPA)
                          ┌────────────┼───────────────┐
                       regioes   estacoes_monitoramento  leituras_climaticas
                                        │
                              Resposta JSON ◄── Back-end
                                        │
                      JavaScript atualiza cards + gráficos
```

1. Usuário digita cidade e clica **Sincronizar**.
2. Front-end chama `POST /api/clima/sincronizar?cidade=`.
3. Back-end consulta a OpenWeather API.
4. Dados são persistidos no Neon PostgreSQL (cria Região, Estação, Sensores e Leituras se não existirem).
5. Front-end recebe resposta, chama `fetchAllData()` e re-renderiza todo o dashboard.
6. A cada **30 segundos**, o dashboard repete o passo 5 automaticamente.

---

## 💾 4. Modelagem do Banco de Dados (Neon PostgreSQL)

```sql
-- Regiões geográficas monitoradas
CREATE TABLE regioes (
    id_regiao        SERIAL PRIMARY KEY,
    nome_regiao      VARCHAR(100) NOT NULL,
    estado_provincia VARCHAR(100),
    pais             VARCHAR(100) NOT NULL,
    latitude         DECIMAL(9,6),
    longitude        DECIMAL(9,6)
);

-- Estações de monitoramento vinculadas a regiões
CREATE TABLE estacoes_monitoramento (
    id_estacao         SERIAL PRIMARY KEY,
    nome_estacao       VARCHAR(100) NOT NULL,
    id_regiao          INT REFERENCES regioes(id_regiao) ON DELETE CASCADE,
    data_instalacao    DATE,
    status_operacional VARCHAR(20) DEFAULT 'Ativa'
);

-- Sensores instalados em cada estação
CREATE TABLE sensores (
    id_sensor     SERIAL PRIMARY KEY,
    id_estacao    INT REFERENCES estacoes_monitoramento(id_estacao) ON DELETE CASCADE,
    tipo_sensor   VARCHAR(50) NOT NULL,
    unidade_medida VARCHAR(20) NOT NULL
);

-- Histórico de leituras (tabela fato)
CREATE TABLE leituras_climaticas (
    id_leitura       BIGSERIAL PRIMARY KEY,
    id_sensor        INT REFERENCES sensores(id_sensor) ON DELETE CASCADE,
    data_hora_leitura TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valor_medido     DECIMAL(10,2) NOT NULL
);

-- Fontes de emissão industrial por região
CREATE TABLE fontes_emissao (
    id_fonte               SERIAL PRIMARY KEY,
    id_regiao              INT REFERENCES regioes(id_regiao) ON DELETE SET NULL,
    nome_empresa_local     VARCHAR(150),
    tipo_poluente          VARCHAR(50),
    emissao_anual_estimada DECIMAL(12,2)
);
```

---

## ⏱️ 5. Agendamento Automático — ClimaScheduler

O `ClimaScheduler.java` executa automaticamente a cada **10 minutos** e sincroniza 9 cidades mundiais:

> Brasília · São Paulo · Nova York · Londres · Tóquio · Paris · Sydney · Cairo · Lisboa

- Habilitado pela anotação `@EnableScheduling` em `Main.java`.
- `@Scheduled(fixedRate = 600000, initialDelay = 10000)` — roda a cada 10 min, inicia 10s após o servidor subir.
- Respeita o limite da API gratuita: `Thread.sleep(1500)` entre cada cidade.

---

## 🚀 6. Como Executar Localmente

### Pré-requisitos
- Java JDK 21
- Maven 3.9+
- IDE: VS Code (com extensão Java Extension Pack) ou IntelliJ IDEA

### Back-end
```bash
# Na raiz do projeto (onde está o pom.xml)
mvn spring-boot:run
```
> O servidor sobe em `http://localhost:8080`

### Front-end
1. Abra `index.html` diretamente no navegador **ou** use a extensão **Live Server** (VS Code).
2. Clique no ícone ⚙️ no canto superior direito.
3. Defina a URL como `http://localhost:8080` e clique **Salvar**.
4. Digite uma cidade e clique **Sincronizar**.

### Solucionar erro "import org.springframework cannot be resolved" no VS Code
Este erro aparece quando o VS Code não reconheceu o projeto Maven ainda. Execute:
```bash
mvn clean install -DskipTests
```
Depois, no VS Code: `Ctrl+Shift+P` → **Java: Clean Java Language Server Workspace** → **Restart and delete**.

---

## 🧪 7. Testes Automatizados

Implementados com **JUnit 5 + MockMvc + H2 em memória** para garantir independência do banco de produção.

```bash
# Rodar todos os testes
mvn clean test
```

A pipeline **GitHub Actions** compila e roda os testes automaticamente a cada `git push` ou Pull Request.

---

## 📐 8. Arquitetura de Atualização em Tempo Real (Front-end)

```
DOMContentLoaded
    │
    ├── checkBackendStatus()  ──────────────── setInterval 15s
    │       │
    │       └─ se online ──► fetchAllData()
    │
    └── fetchAllData()  ────────────────────── setInterval 30s (auto-refresh)
            │
            ├── Promise.all([regioes, estacoes, sensores, leituras, emissoes])
            │
            └── updateDashboardUI()
                    ├── calculateMetrics()
                    ├── populateTables()
                    ├── populateDropdowns()
                    ├── renderClimaticChart()
                    └── renderEmissionsChart()
```

- **Guarda de concorrência**: flag `isFetching` evita múltiplos fetches simultâneos.
- **Auto-switch de aba**: após salvar um formulário, a aba de dados correspondente abre automaticamente.
- **Timestamp**: elemento `#last-updated` mostra `Atualizado às HH:MM:SS` a cada refresh.

---

## 🎓 9. Aprendizados

1. **Full-Stack Integrado**: coordenação entre fetch assíncrono do front-end, controladores Spring Boot e integrações com APIs externas solidificou o entendimento de arquiteturas web modernas e CORS.
2. **Banco de Dados Relacional em Nuvem**: migração de dados em memória para PostgreSQL (Neon) expôs discussões sobre chaves estrangeiras, integridade referencial e mapeamento ORM (JPA/Hibernate).
3. **CI/CD com GitHub Actions**: pipeline automatizada separa ambientes de teste (H2) e produção (PostgreSQL), garantindo builds consistentes.
4. **Agendamento**: implementação do `ClimaScheduler` com `@EnableScheduling` e `@Scheduled` demonstrou como tarefas de background funcionam no ecossistema Spring.
5. **UX e Acessibilidade**: formulários dinâmicos com dropdown condicional, guia visual de fluxo e atributos ARIA reduzem o atrito cognitivo para o usuário entender a hierarquia do banco de dados.
6. **Design Responsivo**: media queries para 320px–1024px+ garantem boa experiência em mobile, tablet e desktop.
7. **Uso Ético de IA**: ferramentas de IA aceleraram depuração e geração de código, mas decisões arquiteturais, modelagem relacional e compreensão do sistema foram absorvidas de forma concreta pelos autores.
