# Cronograma de Sprints - Jornada Oncológica (MVP)
**Papel:** Gerente de Projetos (PM)  
**Prazo Final de Implementação e Testes de Código:** 07 de Setembro de 2026 (Segunda-feira)  
**Divisão da Equipe:**  
- **Front-end 1 (F1):** Focado em Fluxo Geral, Dashboards (Recepção/Profissional/Coordenação), Cadastro de Pacientes e Consulta Pública da Jornada.
- **Front-end 2 (F2):** Focado em Componentes de Formulários das 10 Especialidades, Seção de Informações Compartilhadas com Histórico, e Ficha Consolidada (com exportação para PDF).
- **Back-end (B1):** Focado no desenvolvimento dos endpoints da API REST (FastAPI), lógica de negócios e persistência.
- **Banco de Dados & Testes (T1):** Focado em migrações (Alembic), infraestrutura Docker, sementes de banco (seed) e testes de integração automatizados (pytest).

---

## Calendário Geral do Projeto
- **Período de Execução:** 28 de Agosto de 2026 a 07 de Setembro de 2026 (11 dias corridos)
- **Sprint 1 (Integração e Estruturação):** 28/08 (Sexta-feira) a 02/09 (Quarta-feira)
- **Sprint 2 (Focalização e Testes de Código):** 03/09 (Quinta-feira) a 07/09 (Segunda-feira)

---

## 🏃 Sprint 1: Integração de Fluxo e Estruturação de Endpoints (28/08 a 02/09)
**Objetivo da Sprint:** Conectar as telas principais do frontend à API, implementar o CRUD do Paciente/Jornada, realizar o setup das migrações e implementar os formulários iniciais de atendimento (Recepção, Enfermagem e Medicina).

### Distribuição de Tarefas (Para copiar e criar as Issues no GitHub)

#### 🟩 Issue 1 (Front-end 1): Integração do Cadastro e Tela de Login
* **Responsável:** Front-end 1 (F1)
* **Status:** A Fazer
* **Data Limite:** 31 de Agosto de 2026
* **Descrição:**
  Implementar a integração com a API nas telas de Login, Cadastro de Pacientes e Consulta Pública de Jornadas.
* **Critérios de Aceitação:**
  - [ ] Integrar a tela de Login direcionando para o dashboard correto com base no perfil selecionado (`recepcao`, `profissional`, `coordenacao`).
  - [ ] Tela de Cadastro de Paciente enviando os dados básicos (`nome`, `data de nascimento`, `CPF`, `CNS`, `telefone`, `endereço`, `contato de emergência`, `acompanhante`, `diagnóstico inicial`, `CID` e `origem`) para o endpoint `POST /pacientes`.
  - [ ] Tela pública de consulta de jornada exibindo o progresso visual de cada especialidade consultando o endpoint `GET /pacientes/{id_ou_nome}/jornada` (garantindo que nenhuma informação clínica sensível seja exposta).

#### 🟩 Issue 2 (Front-end 2): Formulários Base (Recepção, Enfermagem, Medicina) e Informações Compartilhadas
* **Responsável:** Front-end 2 (F2)
* **Status:** A Fazer
* **Data Limite:** 01 de Setembro de 2026
* **Descrição:**
  Desenvolver a lógica de reaproveitamento de campos em formulários e integrar as três primeiras etapas da jornada.
* **Critérios de Aceitação:**
  - [ ] Formulário de Enfermagem enviando dados de comorbidades, hábitos (tabagismo, etilismo), peso e altura para a API.
  - [ ] Exibir dados reaproveitados com badge de indicação visual de origem (ex: *"Peso: 68kg registrado por Enfermagem às 09:25"*).
  - [ ] Criar a seção visual de "Informações Compartilhadas" no painel do paciente, contendo o histórico de alterações de cada dado (peso, altura, alergias).
  - [ ] Formulário de Medicina consumindo as informações preenchidas pela Enfermagem e permitindo preenchimento de diagnóstico oncológico, estadiamento e conduta.

#### 🟩 Issue 3 (Back-end): Endpoints Básicos do MVP e CRUD de Paciente/Jornada
* **Responsável:** Back-end (B1)
* **Status:** A Fazer
* **Data Limite:** 31 de Agosto de 2026
* **Descrição:**
  Criar os endpoints REST em FastAPI para dar suporte ao cadastro de pacientes e ao controle das etapas da jornada.
* **Critérios de Aceitação:**
  - [ ] Criar endpoint `POST /login` retornando token mockado ou autenticação básica.
  - [ ] Criar CRUD completo do Paciente: `POST /pacientes`, `GET /pacientes`, `GET /pacientes/{id}`.
  - [ ] Criar endpoint para controle de Jornadas: `POST /jornadas` (iniciar jornada) e `GET /jornadas/{id}`.
  - [ ] Criar endpoint para atualizar status de etapas: `PATCH /jornadas/{id}/etapas/{id_etapa}`.
  - [ ] Garantir que o banco de dados armazene as chaves estrangeiras corretamente segundo o modelo implementado.

#### 🟩 Issue 4 (DB/Testes): Setup do Banco de Dados no Docker, Migrações e Testes de Endpoint
* **Responsável:** Banco/Testes (T1)
* **Status:** A Fazer
* **Data Limite:** 02 de Setembro de 2026
* **Descrição:**
  Configurar o versionamento do banco com Alembic no Docker e escrever testes de integração automatizados.
* **Critérios de Aceitação:**
  - [ ] Inicializar e configurar o Alembic dentro da pasta `/backend`.
  - [ ] Criar a primeira migração que gera todas as tabelas (Pacientes, Jornadas, Etapas, Resumos).
  - [ ] Desenvolver um script de sementes (seed data) para criar os 10 formulários populando todas as perguntas reais das especialidades no banco de dados (incluindo as 27 do IRPO, os blocos da ASG-PPP, etc.) e 3 pacientes de teste com jornadas.
  - [ ] Escrever testes de integração usando `pytest` e `httpx.AsyncClient` para testar os endpoints de Pacientes e Jornadas.

---

## 🏃 Sprint 2: Implementação de Especialidades, Consolidação e Testes de Código (03/09 a 07/09)
**Objetivo da Sprint:** Integrar os formulários complexos restantes (Nutrição, Fisioterapia, TO, Psicologia, Serviço Social, Odonto, Fono), realizar cálculos automáticos no frontend, gerar a ficha consolidada (PDF) e rodar toda a suíte de testes finais para fechamento do MVP.

### Distribuição de Tarefas (Para copiar e criar as Issues no GitHub)

#### 🟦 Issue 5 (Front-end 1): Dashboards de Atendimento e Painel de Coordenação
* **Responsável:** Front-end 1 (F1)
* **Status:** A Fazer
* **Data Limite:** 05 de Setembro de 2026
* **Descrição:**
  Implementar os dashboards profissionais e da coordenação para exibir status reais das etapas e alertas.
* **Critérios de Aceitação:**
  - [ ] Dashboard da Recepção mostrando fila de espera em tempo real alimentada pela API.
  - [ ] Dashboard Multiprofissional exibindo lista de pacientes ativos, quais especialidades já atenderam e quais estão pendentes.
  - [ ] Dashboard da Coordenação com indicadores agregados (Tempo de Espera Médio, Pacientes Ativos, Gargalos por Especialidade).
  - [ ] Integração com sistema de notificações em tempo real (aviso de paciente aguardando ou pronto para a próxima especialidade).

#### 🟦 Issue 6 (Front-end 2): Formulários de Especialidades Complexas, Ficha Consolidada e PDF
* **Responsável:** Front-end 2 (F2)
* **Status:** A Fazer
* **Data Limite:** 06 de Setembro de 2026
* **Descrição:**
  Integrar todos os formulários com as perguntas completas (incluindo as não mostradas no Figma) contendo cálculos lógicos automáticos e a exportação da ficha de acolhimento consolidada.
* **Critérios de Aceitação:**
  - [ ] Mapear e implementar na interface todas as perguntas faltantes dos instrumentos originais das especialidades (ex: todos os detalhes de exame físico da Enfermagem, as 27 perguntas do IRPO, etc.).
  - [ ] **Nutrição:** Formulário ASG-PPP calculando o escore automaticamente e calculando IMC de forma dinâmica (`IMC = peso / altura²`).
  - [ ] **Psicologia:** Triagem IRPO de 27 itens calculando o Índice Global de Risco (IGR) e exibindo alertas em caso de risco clínico.
  - [ ] **Fisioterapia / Terapia Ocupacional / Serviço Social / Odonto / Fono:** Implementar campos dinâmicos (condicionais baseados em respostas anteriores).
  - [ ] Tela de **Ficha Consolidada** exibindo o resumo de todas as especialidades envolvidas.
  - [ ] Botão de "Exportar PDF" que gera e baixa o layout limpo da ficha consolidada.

#### 🟦 Issue 7 (Back-end): API de Formulários Específicos e Geração de Documentos
* **Responsável:** Back-end (B1)
* **Status:** A Fazer
* **Data Limite:** 05 de Setembro de 2026
* **Descrição:**
  Criar endpoints flexíveis para armazenamento de respostas de formulários que suportem a totalidade de campos mapeados nos instrumentos clínicos reais, além de lógica de cálculo no backend.
* **Critérios de Aceitação:**
  - [ ] Criar endpoint `POST /jornadas/{id}/formularios/{id_especialidade}` para salvar respostas específicas de cada especialidade.
  - [ ] Criar endpoint `GET /jornadas/{id}/resumo-consolidado` que busca todas as respostas das especialidades e gera uma estrutura consolidada.
  - [ ] Implementar endpoint opcional de download de PDF ou suporte à formatação de dados para impressão direta via navegador.

#### 🟦 Issue 8 (DB/Testes): Testes de Regra de Negócio e Validação Final do Código
* **Responsável:** Banco/Testes (T1)
* **Status:** A Fazer
* **Data Limite:** 07 de Setembro de 2026
* **Descrição:**
  Garantir a qualidade do código com testes unitários para as regras de negócio complexas (escore IRPO, cálculo IMC, validação de status de jornada) e fechamento do pipeline de CI.
* **Critérios de Aceitação:**
  - [ ] Escrever testes unitários em `pytest` cobrindo a lógica de cálculo do IGR (Psicologia) e do escore ASG-PPP (Nutrição).
  - [ ] Escrever testes de integração validando que uma jornada muda de status para "Finalizada" apenas quando todas as etapas obrigatórias forem atendidas ou marcadas como "Não se aplica".
  - [ ] Rodar o Ruff Linter e garantir que não há erros de lint pendentes no backend.
  - [ ] Apresentar relatório final dos testes rodando localmente na branch `main`.

---

## 📋 Regras de Entrega e Verificação
1. **Pull Requests (PRs):** Nenhuma alteração deve ser enviada diretamente para a branch `main`. Todas as entregas de tarefas devem passar por PRs avaliados por outro membro da equipe.
2. **Docker:** Todo o desenvolvimento do back-end e front-end deve rodar localmente via `docker-compose up`.
3. **Padrão de Código:** O código Python deve seguir as regras definidas no Ruff (`pyproject.toml`) antes do merge.
4. **Mapeamento Completo dos Instrumentos Clínicos:** Tanto no banco de dados (scripts de sementes e tabelas), quanto no backend (endpoints de validação) e no frontend (campos e inputs de formulário), devem ser integradas **todas as perguntas dos formulários reais** das 10 especialidades multiprofissionais, e não apenas o subconjunto parcial que estava visível no protótipo original do Figma. 

