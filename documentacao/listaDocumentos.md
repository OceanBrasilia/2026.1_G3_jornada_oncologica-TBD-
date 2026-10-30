# 📂 Jornada Oncológica - Lista de Documentos do Projeto

Este documento reúne o índice de todos os artefatos de documentação, modelagem, especificações técnicas e materiais estratégicos desenvolvidos para o projeto **Jornada Oncológica**.

---

## 📋 Lista Geral de Documentos

| Documento | Descrição | Formato | Status | Localização/Link |
| :--- | :--- | :---: | :---: | :--- |
| **Especificação de Requisitos** | Requisitos funcionais, não funcionais, regras de negócio e casos de uso do sistema. | PDF | ✅ Disponível | [SRSRequisitos.pdf](SRSRequisitos.pdf) |
| **Modelo de Banco de Dados** | Modelagem conceitual, lógica e física do banco de dados, incluindo diagrama ERD e scripts SQL. | PDF | ✅ Disponível | [ModelagemBancodeDados.pdf](ModelagemBancodeDados.pdf) |
| **Business Model Canvas (BMC)** | Quadro de modelo de negócios definindo a proposta de valor, parceiros, clientes e estrutura de custos. | PDF | ✅ Disponível | [BusinessModelCanvas.pdf](BusinessModelCanvas.pdf) |
| **Roadmap e Backlog Pós-MVP** | Balanço do MVP entregue e lista priorizada de épicos e tarefas futuras (AGHU, Intranet HUB, LGPD e itens pendentes do SRS). | PDF / Markdown | ✅ Disponível | [Roadmap_Backlog_Pos_MVP.pdf](Roadmap_Backlog_Pos_MVP.pdf) · [Roadmap_Backlog_Pos_MVP.md](Roadmap_Backlog_Pos_MVP.md) |
| **Cronograma de Sprints (MVP)** | Planejamento das Sprints 1 e 2 e divisão das Issues do MVP entregue. | Markdown | ✅ Disponível | [cronograma_sprints.md](cronograma_sprints.md) |
| **Testes de Usabilidade Final** | Relatório consolidado da avaliação de usabilidade do sistema. | PDF | ✅ Disponível | [testesdeusabilidadefinal.pdf.pdf](testesdeusabilidadefinal.pdf.pdf) |
| **Guia Prático de Testes** | Passo a passo para rodar o sistema e testar os cenários no navegador. | Markdown | ✅ Disponível | [COMO_TESTAR.md](../COMO_TESTAR.md) |
| **Análise de Dados de Formulários** | Relatório analítico consolidando os dados colhidos por formulários com pacientes e profissionais de saúde. | PDF | ❌ Falta fazer upload | Mantenha em `documentacao/pdfs/analise_dados_formularios.pdf` após upload |
| **Arquitetura do Sistema** | Visão geral da arquitetura, stack tecnológica, fluxo de dados e diagramas (C4 Model/UML). | Markdown | ❌ Falta criar/fazer upload | Mantenha em `documentacao/arquitetura.md` após criação |
| **Manual de Instalação e Execução** | Instruções passo a passo para configuração do ambiente, Docker e execução local. | Markdown | ✅ Disponível | [README.md](../README.md) |

---

## 🛠️ Detalhes dos Documentos

### 1. 📝 Especificação de Requisitos (`SRSRequisitos.pdf`)
*   **Status:** ✅ Disponível localmente e no repositório.
*   **Objetivo:** Mapear o escopo do projeto, definindo o comportamento do sistema de acordo com as necessidades dos usuários (pacientes, médicos, administradores).
*   **Conteúdo:** Matriz de Rastreabilidade, Diagramas de Caso de Uso e Requisitos Funcionais (RFs) e Não Funcionais (RNFs).

### 2. 🗄️ Modelo de Banco de Dados (`ModelagemBancodeDados.pdf`)
*   **Status:** ✅ Disponível localmente e no repositório.
*   **Objetivo:** Definir a estrutura de persistência das informações da Jornada Oncológica.
*   **Conteúdo:** Diagrama Entidade-Relacionamento (DER), tabelas física/lógica e scripts correspondentes.

### 3. 🎯 Business Model Canvas (`BusinessModelCanvas.pdf`)
*   **Status:** ✅ Disponível localmente e no repositório.
*   **Objetivo:** Mapear de forma visual o modelo de negócios do aplicativo, focando nas parcerias com clínicas oncológicas, fontes de receitas e proposta de valor.
*   **Conteúdo:** Clientes, Atividades-Chave, Recursos-Chave, Fontes de Receita, Estrutura de Custos, Canais e Relacionamento.

### 4. 📊 Roadmap e Backlog Pós-MVP (`Roadmap_Backlog_Pos_MVP.pdf` e `.md`)
*   **Status:** ✅ Disponível localmente e no repositório (formatos PDF e Markdown).
*   **Objetivo:** Registrar o balanço do MVP entregue (passagem de bastão) e priorizar as evoluções técnicas, assistenciais e de infraestrutura para entrada em produção no HUB/Ebserh.
*   **Conteúdo:** 5 Épicos e 19 itens (`BL-01` a `BL-19`) cobrindo subida em servidor do HUB, publicação na Intranet `hubrasil`, login institucional LDAP/AD, integração com AGHU, adequações completas de segurança/LGPD, requisitos pendentes do SRS Asana e checklist de pontos `[CONFIRMAR COM A EQUIPE]`.

### 5. 📝 Análise de Dados de Formulários (`analise_dados_formularios.pdf`)
*   **Status:** ❌ Falta fazer upload (pendente de envio para a pasta `documentacao/pdfs/`).
*   **Objetivo:** Sintetizar e embasar as decisões de design do sistema com base nos resultados das pesquisas aplicadas a pacientes em tratamento e médicos.
*   **Conteúdo Previsto:** Métricas de dor (painpoints), taxas de resposta de formulários de triagem e gráficos estatísticos das necessidades dos usuários.

### 6. 🏗️ Arquitetura do Sistema (`arquitetura.md`)
*   **Status:** ❌ Falta criar/fazer upload (pendente de criação do documento na pasta `documentacao/`).
*   **Objetivo:** Descrever a divisão de responsabilidades entre o Frontend e o Backend, bem como a comunicação via APIs RESTful.
*   **Conteúdo Previsto:** Arquitetura de pastas (Monorepo), design patterns estruturais e políticas de segurança/autenticação.
