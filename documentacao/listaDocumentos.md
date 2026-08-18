# 📂 Jornada Oncológica - Lista de Documentos do Projeto

Este documento reúne o índice de todos os artefatos de documentação, modelagem, especificações técnicas e materiais estratégicos desenvolvidos para o projeto **Jornada Oncológica**.

---

## 📋 Lista Geral de Documentos

| Documento | Descrição | Formato | Status | Localização/Link |
| :--- | :--- | :---: | :---: | :--- |
| **Especificação de Requisitos** | Requisitos funcionais, não funcionais, regras de negócio e casos de uso do sistema. | Markdown | ⏳ Planejado | [requisitos.md](requisitos.md) |
| **Modelo de Banco de Dados** | Modelagem conceitual, lógica e física do banco de dados, incluindo diagrama ERD e scripts SQL. | Markdown / SQL | ⏳ Planejado | [banco_dados.md](banco_dados.md) |
| **Arquitetura do Sistema** | Visão geral da arquitetura, stack tecnológica, fluxo de dados e diagramas (C4 Model/UML). | Markdown | ⏳ Planejado | [arquitetura.md](arquitetura.md) |
| **Product Backlog** | Histórico/lista de funcionalidades priorizadas (User Stories), épicos e tarefas do projeto. | PDF | ⏳ Planejado | [backlog.pdf](pdfs/backlog.pdf) |
| **Business Model Canvas (BMC)** | Quadro de modelo de negócios definindo a proposta de valor, parceiros, clientes e estrutura de custos. | PDF | ⏳ Planejado | [business_model_canvas.pdf](pdfs/business_model_canvas.pdf) |
| **Análise de Dados de Formulários** | Relatório analítico consolidando os dados colhidos por formulários com pacientes e profissionais de saúde. | PDF | ⏳ Planejado | [analise_dados_formularios.pdf](pdfs/analise_dados_formularios.pdf) |
| **Manual de Instalação e Execução** | Instruções passo a passo para configuração do ambiente, Docker e execução local. | Markdown | ⏳ Planejado | [README.md](../README.md) |

---

## 🛠️ Detalhes dos Documentos

### 1. 📝 Especificação de Requisitos (`requisitos.md`)
*   **Objetivo:** Mapear o escopo do projeto, definindo o comportamento do sistema de acordo com as necessidades dos usuários (pacientes, médicos, administradores).
*   **Conteúdo Previsto:** Matriz de Rastreabilidade, Diagramas de Caso de Uso e Requisitos Funcionais (RFs) e Não Funcionais (RNFs).

### 2. 🗄️ Modelo de Banco de Dados (`banco_dados.md`)
*   **Objetivo:** Definir a estrutura de persistência das informações da Jornada Oncológica.
*   **Conteúdo Previsto:** Diagrama Entidade-Relacionamento (DER) e scripts DDL (Criação) e DML (População inicial/Seeders).

### 3. 🏗️ Arquitetura do Sistema (`arquitetura.md`)
*   **Objetivo:** Descrever a divisão de responsabilidades entre o Frontend e o Backend, bem como a comunicação via APIs RESTful.
*   **Conteúdo Previsto:** Arquitetura de pastas (Monorepo), design patterns estruturais e políticas de segurança/autenticação.

### 4. 📊 Product Backlog (`pdfs/backlog.pdf`)
*   **Objetivo:** Gerenciar o ciclo de desenvolvimento do software sob a perspectiva ágil (Scrum/Kanban).
*   **Conteúdo Previsto:** Lista de histórias de usuário (User Stories), com critérios de aceitação, esforço estimado (Story Points) e prioridade.

### 5. 🎯 Business Model Canvas (`pdfs/business_model_canvas.pdf`)
*   **Objetivo:** Mapear de forma visual o modelo de negócios do aplicativo, focando nas parcerias com clínicas oncológicas, fontes de receitas e proposta de valor.
*   **Conteúdo Previsto:** Clientes, Atividades-Chave, Recursos-Chave, Fontes de Receita, Estrutura de Custos, Canais e Relacionamento.

### 6. 📝 Análise de Dados de Formulários (`pdfs/analise_dados_formularios.pdf`)
*   **Objetivo:** Sintetizar e embasar as decisões de design do sistema com base nos resultados das pesquisas aplicadas a pacientes em tratamento e médicos.
*   **Conteúdo Previsto:** Métricas de dor (painpoints), taxas de resposta de formulários de triagem e gráficos estatísticos das necessidades dos usuários.


