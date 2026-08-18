# 📂 Jornada Oncológica - Lista de Documentos do Projeto

Este documento reúne o índice de todos os artefatos de documentação, modelagem, especificações técnicas e materiais estratégicos desenvolvidos para o projeto **Jornada Oncológica**.

---

## 📋 Lista Geral de Documentos

| Documento | Descrição | Formato | Status | Localização/Link |
| :--- | :--- | :---: | :---: | :--- |
| **Especificação de Requisitos** | Requisitos funcionais, não funcionais, regras de negócio e casos de uso do sistema. | PDF | ✅ Disponível | [SRSRequisitos.pdf](SRSRequisitos.pdf) |
| **Modelo de Banco de Dados** | Modelagem conceitual, lógica e física do banco de dados, incluindo diagrama ERD e scripts SQL. | PDF | ✅ Disponível | [ModelagemBancodeDados.pdf](ModelagemBancodeDados.pdf) |
| **Business Model Canvas (BMC)** | Quadro de modelo de negócios definindo a proposta de valor, parceiros, clientes e estrutura de custos. | PDF | ✅ Disponível | [BusinessModelCanvas.pdf](BusinessModelCanvas.pdf) |
| **Product Backlog** | Histórico/lista de funcionalidades priorizadas (User Stories), épicos e tarefas do projeto. | PDF | ❌ Falta fazer upload | Mantenha em `documentacao/pdfs/backlog.pdf` após upload |
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

### 4. 📊 Product Backlog (`backlog.pdf`)
*   **Status:** ❌ Falta fazer upload (pendente de envio para a pasta `documentacao/pdfs/`).
*   **Objetivo:** Gerenciar o ciclo de desenvolvimento do software sob a perspectiva ágil (Scrum/Kanban).
*   **Conteúdo Previsto:** Lista de histórias de usuário (User Stories), com critérios de aceitação, esforço estimado (Story Points) e prioridade.

### 5. 📝 Análise de Dados de Formulários (`analise_dados_formularios.pdf`)
*   **Status:** ❌ Falta fazer upload (pendente de envio para a pasta `documentacao/pdfs/`).
*   **Objetivo:** Sintetizar e embasar as decisões de design do sistema com base nos resultados das pesquisas aplicadas a pacientes em tratamento e médicos.
*   **Conteúdo Previsto:** Métricas de dor (painpoints), taxas de resposta de formulários de triagem e gráficos estatísticos das necessidades dos usuários.

### 6. 🏗️ Arquitetura do Sistema (`arquitetura.md`)
*   **Status:** ❌ Falta criar/fazer upload (pendente de criação do documento na pasta `documentacao/`).
*   **Objetivo:** Descrever a divisão de responsabilidades entre o Frontend e o Backend, bem como a comunicação via APIs RESTful.
*   **Conteúdo Previsto:** Arquitetura de pastas (Monorepo), design patterns estruturais e políticas de segurança/autenticação.
