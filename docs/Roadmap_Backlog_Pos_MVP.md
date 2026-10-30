# 📋 Roadmap e Backlog Pós-MVP — Plano de Evolução e Continuidade

**Projeto:** A Jornada Conectada — Transformando o Acolhimento Oncológico  
**Unidade demandante:** Unidade de Oncologia (UNACON) — Hospital Universitário de Brasília (HUB/Ebserh)  
**Elaborado por:** Grupo 3 — Residência Tecnológica em Saúde Digital  
**Base de referência:** `documentacao/SRSRequisitos.pdf` (*SRS no template Asana — Grupo 3, v0.1*) e código-fonte consolidado na branch `main` (Outubro/2026).

> **Nota de governança clínica e institucional:** Todos os itens que envolvem fluxo assistencial, regras clínicas, privacidade (LGPD) ou políticas de TI hospitalar estão sinalizados com **`[CONFIRMAR COM A EQUIPE]`** para validação conjunta com as responsáveis pelo problema, Coordenação da Oncologia e equipe técnica (SETISD/TI do HUB/Ebserh) antes da implementação.

---

## 📌 1. Balanço do Ciclo Atual (MVP Entregue e Retrospectiva)

Ao longo do ciclo de desenvolvimento (Maio a Outubro de 2026), a equipe transformou um fluxo antes fragmentado em papel em um **MVP funcional responsivo (computador, tablet e celular)**, entregando:
- **Fluxo multiprofissional integrado das 10 áreas:** Recepção, Enfermagem, Medicina, Nutrição, Fisioterapia, Serviço Social, Psicologia, Odontologia, Fonoaudiologia e Terapia Ocupacional.
- **Reaproveitamento de dados compartilhados (`RF06` / `RF09`):** sinais vitais, antropometria, alergias, comorbidades e hábitos herdados entre formulários com indicação visual da especialidade de origem.
- **Cálculos clínicos auditáveis (`RF21`) e Arquitetura de Alertas em 4 Níveis (`RF20`):** IMC automático, triagem nutricional ASG-PPP e protocolo IRPO (Psicologia), respeitando sigilo de alertas confidenciais e sem decisão clínica automática.
- **Proteção contra perda de preenchimento (`RF25` / `RNF10`):** salvamento automático de rascunhos e motor declarativo de campos condicionais (`showIf`).
- **Consolidação e Exportação (`RF17` / `RF18`):** geração da Ficha Consolidada com controle de versão e exportação limpa em PDF e DOCX, além da consulta simplificada da jornada para paciente/acompanhante (`RN05` / `RN07`) e suíte automatizada de testes no front-end e no back-end.

**Por que este documento existe (Passagem de Bastão / *Handover*):**  
Conforme previsto na Seção 1.2 (*"Fora do escopo nesta versão"*) e no Quadro 13 do `SRSRequisitos.pdf`, a entrada em **operação real dentro do HUB** exige etapas de infraestrutura hospitalar, segurança em servidor e integrações externas que não faziam parte do escopo do MVP acadêmico. As seções abaixo detalham esse **Backlog Pós-MVP priorizado**.

---

## 🗺️ 2. Visão Geral dos Épicos Pós-MVP

| Épico | Foco Principal | Prioridade Sugerida |
| :--- | :--- | :---: |
| **Épico 1** | Subida do sistema nos servidores do HUB e acesso seguro na Intranet | 🔴 Alta (Pré-Produção) |
| **Épico 2** | Integração com banco de dados / APIs do AGHU e sistemas hospitalares | 🔴 Alta / 🟡 Média |
| **Épico 3** | Segurança, LGPD, autenticação real e persistência 100% no banco | 🔴 Alta (Pré-Produção) |
| **Épico 4** | Requisitos do SRS Asana Grupo 3 pendentes ou parciais no MVP | 🟡 Média (Consolidação) |
| **Épico 5** | Portal do paciente/acompanhante, painel de TV e canais externos | 🟢 Futura (Expansão) |

---

## 🏗️ Épico 1 — Implantação ("Subir" o Sistema) e Acesso na Intranet do HUB

### BL-01 · Subir a aplicação e o banco de dados na infraestrutura oficial do HUB/Ebserh
- **Referência no SRS:** `HW-04`, `SW-02`, `RNF13`, `RNF16`, `Quadro 13`
- **Prioridade:** 🔴 Alta
- **Como está hoje:** O sistema roda localmente via Docker Compose (`frontend`, `backend` e `PostgreSQL`) ou apontando manualmente para uma VM de testes do projeto.
- **O que implementar no futuro:**
  - Preparar configuração de produção (`docker-compose.prod.yml`, variáveis de ambiente seguras fora do repositório e build otimizado do React servido via Nginx).
  - Provisionar servidor institucional (VM interna do HUB ou nuvem homologada pela Ebserh) com banco PostgreSQL dedicado de homologação e de produção.
  - Automatizar execução das migrações do banco (`alembic upgrade head`) a cada nova versão publicada.
  - Configurar pipeline de CI/CD para exigir aprovação nos testes automatizados (`pytest` + `vitest`) antes de publicar no servidor (`Seção 4.6`).
- **Pontos pendentes:** `[CONFIRMAR COM A EQUIPE]` Definir junto à TI do HUB/Ebserh o ambiente oficial de hospedagem, capacidade de servidor e janelas de atualização, validando a estimativa inicial de ~20 usuários simultâneos e ~1.000 pacientes/ano (`Quadro 4` e `Quadro 13`).

### BL-02 · Disponibilizar acesso seguro na Intranet do HUB (`hubrasil`)
- **Referência no SRS:** `HW-05`, `COM-01`, `COM-02`
- **Prioridade:** 🔴 Alta
- **Como está hoje:** O acesso ocorre por `localhost` ou IP direto em ambiente de desenvolvimento, sem HTTPS institucional nem endereço interno padronizado.
- **O que implementar no futuro:**
  - Publicar o sistema na rede interna (Intranet `hubrasil`) com endereço amigável (ex.: `acolhimento-onco.hub.ebserh.gov.br`).
  - Configurar proxy reverso com certificado digital TLS/HTTPS válido (`COM-01`) para criptografar dados sensíveis em trânsito entre computadores/tablets dos consultórios e o servidor.
  - Restringir o `CORS` no FastAPI (`backend/app/main.py`) exclusivamente ao domínio oficial da intranet, removendo o `allow_origins=["*"]` usado em desenvolvimento.
  - Garantir conectividade Wi-Fi institucional estável para uso em tablets e celulares pelas equipes nos ambulatórios (`HW-02`, `HW-03`).
- **Pontos pendentes:** `[CONFIRMAR COM A EQUIPE]` Confirmar com a TI/Segurança da Informação do HUB se o sistema ficará acessível **apenas** na intranet para profissionais ou se haverá rota externa separada para consulta simplificada do paciente (`COM-02`, `Seção 1.4.2`).

### BL-03 · Login institucional único (LDAP / Active Directory / SSO Ebserh)
- **Referência no SRS:** `SW-05`, `UI-01`, `RNF07`, `Quadro 13`
- **Prioridade:** 🔴 Alta
- **Como está hoje:** O login utiliza cadastro próprio na tabela `usuario` com senha local.
- **O que implementar no futuro:**
  - Integrar o back-end ao diretório corporativo **LDAP / Active Directory** ou **SSO institucional da Ebserh** (`SW-05`), permitindo que enfermeiros, médicos, equipe multiprofissional e recepção entrem com o mesmo login institucional usado nos computadores do hospital.
  - Mapear grupos/lotação do AD para os perfis do sistema (`recepcao`, `profissional`, `coordenacao`, `administrador`), garantindo bloqueio imediato caso o vínculo institucional seja encerrado.
- **Pontos pendentes:** `[CONFIRMAR COM A EQUIPE]` Definir política de duração de sessão (timeout por inatividade nos consultórios), bloqueio por tentativas inválidas e fluxo de acesso para residentes/estagiários (`Quadro 13`).

### BL-04 · Rotina de Backup, Restauração (RTO/RPO) e Monitoramento em Produção
- **Referência no SRS:** `RNF13`, `RNF17`, `Seção 4.4`, `Quadro 13`
- **Prioridade:** 🔴 Alta
- **Como está hoje:** Existe apenas o endpoint básico de saúde (`GET /health`), sem rotina automatizada de backup nem métricas de disponibilidade.
- **O que implementar no futuro:**
  - Configurar backups automáticos diários/incrementais do PostgreSQL e da pasta de anexos/PDFs gerados, armazenados fora do servidor principal.
  - Criar monitoramento técnico (uso de disco, memória, erros de API e tempo de resposta das buscas — `RNF11`) e rotina periódica de teste de restauração.
- **Pontos pendentes:** `[CONFIRMAR COM A EQUIPE]` Formalizar com a infraestrutura do HUB os valores oficiais de disponibilidade mensal mínima, **RTO** (tempo máximo para restaurar o sistema), **RPO** (perda máxima de dados tolerada) e prazo de retenção de backups e logs (`Quadro 13`).

---

## 🔌 Épico 2 — Integração com o AGHU e Outros Sistemas Hospitalares

### BL-05 · Integração com banco de dados / API do AGHU para busca e pré-cadastro do paciente
- **Referência no SRS:** `SW-03`, `COM-03`, `RNF20`, `RF01`, `RF06`, `RF09`
- **Prioridade:** 🔴 Alta
- **Como está hoje:** A Recepção digita manualmente os dados cadastrais do paciente; não há comunicação com o AGHU (`SW-03` classificado como *Futura* no SRS).
- **O que implementar no futuro:**
  - Criar camada adaptadora segura no back-end (`backend/app/integrations/aghu.py`) — nunca expondo o banco do AGHU diretamente ao front-end (`Seção 3.4`).
  - Permitir que a Recepção pesquise pelo **número de prontuário do AGHU, CPF ou Cartão SUS (CNS)** e importe automaticamente nome completo, nome social, data de nascimento, sexo, endereço, telefones e contatos já cadastrados no AGHU.
  - Vincular o identificador único da jornada (`codigo_publico` / `Patient.id`) ao número de prontuário do AGHU para impedir duplicidade cadastral (`RNF14`).
  - Manter **modo de contingência local** (`Seção 4.8.3`): caso o AGHU esteja indisponível, o acolhimento local continua funcionando normalmente sem perda de dados e concilia o vínculo depois.
- **Pontos pendentes:** `[CONFIRMAR COM A EQUIPE]` Validar com a SETISD/Ebserh se a leitura cadastral será autorizada via **API REST oficial do AGHUx**, **views somente-leitura no banco PostgreSQL do AGHU** ou barramento institucional (`COM-03`, `Quadro 13`).

### BL-06 · Exportação / envio autorizado do resumo de acolhimento para o AGHU
- **Referência no SRS:** `SW-03`, `RF17`, `RF18`, `RN29`, `RN30`, `RNF20`
- **Prioridade:** 🟡 Média
- **Como está hoje:** O profissional gera o PDF/DOCX da Ficha Consolidada no navegador e precisa anexar ou copiar manualmente no sistema hospitalar.
- **O que implementar no futuro:**
  - Quando autorizado pela instituição, permitir o envio do resumo consolidado validado (ou anexação direta do PDF consolidado) para o prontuário/documento externo no AGHU, registrando data, hora, versão e autor na auditoria.
  - Preservar estritamente a regra `RN29`: a plataforma atua como apoio ao acolhimento e **não substitui o prontuário oficial**, exigindo revisão e confirmação humana antes de qualquer envio (`RF20`, `RF21`).
- **Pontos pendentes:** `[CONFIRMAR COM A EQUIPE]` Definir se o AGHU receberá anexação de PDF via API, evolução estruturada de texto ou upload manual assistido (`RN30`, `Quadro 13`).

### BL-07 · Preparação para interoperabilidade futura (SISREG, e-SUS e TrakCare)
- **Referência no SRS:** `SW-04`, `RNF20`, `Seção 1.2`
- **Prioridade:** 🟢 Futura
- **Como está hoje:** A unidade de origem e os dados do encaminhamento inicial são digitados manualmente.
- **O que implementar no futuro:**
  - Padronizar contratos internos de dados clínicos e sociodemográficos (alinhados a padrões de interoperabilidade em saúde, como HL7 FHIR / RNDS quando aplicável) para futura recepção de dados de regulação e atenção primária (**SISREG**, **e-SUS**, **TrakCare**).
- **Pontos pendentes:** `[CONFIRMAR COM A EQUIPE]` Confirmar com a gestão do HUB e SES-DF quais integrações externas têm prioridade institucional em ciclos futuros (`SW-04`).

---

## 🔐 Épico 3 — Segurança, LGPD e Persistência Completa (Lacunas Técnicas do MVP)

### BL-08 · Persistência 100% fim a fim no PostgreSQL (Front-end ↔ API FastAPI)
- **Referência no SRS:** `RF05` a `RF09`, `RF16`, `RF25`, `RF26`, `RNF10`, `RNF14`
- **Prioridade:** 🔴 Alta
- **Como está hoje:** O banco de dados já possui toda a modelagem criada (`backend/app/models.py`), mas no front-end (`App.tsx` e `patientStorage.ts`) parte das respostas detalhadas das 10 especialidades, rascunhos automáticos, alertas, pendências, encaminhamentos e gestão de profissionais ainda opera sobre `localStorage` ou dados de demonstração.
- **O que implementar no futuro:**
  - Integrar todas as telas do front-end às rotas do FastAPI para persistir no PostgreSQL: cadastro completo, check-in/saída da recepção (`RF28`), respostas integrais das 10 especialidades, dados compartilhados (`DadoCompartilhado` — `RN13`, `RN14`), evoluções (`RegistroProfissional` — `RF16`), pendências (`Pendencia` — `RF26`) e encaminhamentos (`Encaminhamento`).
  - Persistir rascunhos automáticos (`RF25` / `RNF10`) também no servidor (`status="RASCUNHO"` em `PreenchimentoFormulario`) a cada 30 segundos ou troca de etapa, mantendo o `localStorage` como contingência contra oscilação de Wi-Fi.
  - Validar no servidor a regra `RN03`: impedir abertura duplicada de jornada ativa para o mesmo paciente no mesmo acolhimento, salvo autorização institucional.

### BL-09 · Autenticação JWT real e filtragem de dados sensíveis no Back-end (LGPD)
- **Referência no SRS:** `RF04`, `RN07`, `RN11`, `RN15`, `RNF07`, `RNF08` e `AGENTS.md (RF-004 / RNF-002)`
- **Prioridade:** 🔴 Alta
- **Como está hoje:** O endpoint `POST /login` retorna um token simulado (`uuid4`) e as rotas da API ainda não validam token JWT nem filtram campos confidenciais no servidor (a ocultação de alertas confidenciais para perfis sem permissão ocorre hoje na interface em `visibleAlerts.ts`).
- **O que implementar no futuro:**
  - Implementar autenticação real com **JWT assinado (ou sessão HttpOnly segura)**, controle de expiração e revogação.
  - Aplicar controle de acesso por perfil e especialidade **diretamente no back-end**: dados confidenciais (risco psíquico/IRPO sensível, violência, vulnerabilidade social detalhada e comunicação diagnóstica) **nunca devem ser carregados na resposta da API** para perfis não autorizados (`RNF08`).
  - Garantir no servidor que cada profissional edite apenas os formulários da sua área (`RN11`) e que exclusões fiquem restritas a perfis autorizados (`RN28`).
- **Pontos pendentes:** `[CONFIRMAR COM A EQUIPE]` Homologar a matriz final de permissões de leitura e escrita entre as 10 especialidades, Recepção, Navegação/Coordenação e Administrador (`Quadro 13`).

### BL-10 · Trilha de auditoria completa e tela de histórico de alterações
- **Referência no SRS:** `RF24`, `RN14`, `RN27`, `RN28`, `RNF09`, `Seção 4.8.2`
- **Prioridade:** 🔴 Alta
- **Como está hoje:** A tabela `RegistroAuditoria` já está modelada em `models.py`, porém as rotas ainda não gravam eventos automaticamente nem há tela de consulta de auditoria.
- **O que implementar no futuro:**
  - Registrar automaticamente em `RegistroAuditoria`: logins/falhas, acesso a registros sensíveis, criação/edição de formulários, alteração de dado compartilhado com valor anterior e novo (`RF24`, `RN14`), ciência/justificativa em alertas Nível 1 e 2, marcação de *"Não se aplica"* (`RN18`), encerramento de jornada (`RF29`), exportação de PDF (`RF18`) e exclusões (`RN28`).
  - Bloquear qualquer alteração nos registros de auditoria e disponibilizar consulta filtrada apenas ao Administrador/Gestão autorizada (`Seção 4.8.2`).

---

## 🧩 Épico 4 — Funcionalidades do SRS Asana Grupo 3 Pendentes ou Parciais no MVP

### BL-11 · Upload, armazenamento seguro e visualização de anexos e exames
- **Referência no SRS:** `RF10`, `RN24`, `RN28`, `Quadro 2`, `Quadro 13`
- **Prioridade:** 🟡 Média
- **Como está hoje:** A tabela `Anexo` existe no banco, mas o sistema ainda não faz upload real nem visualização/download de arquivos PDF ou imagens (biópsias, laudos, encaminhamentos e cartão de consulta).
- **O que implementar no futuro:**
  - Criar endpoints autenticados de upload e download vinculados ao paciente e à jornada (`RN24`), com armazenamento seguro institucional, verificação de tipo/tamanho e hash SHA-256 (`Anexo.hash`).
  - Adicionar visualizador integrado de PDF/imagem para Recepção e equipe multiprofissional.
- **Pontos pendentes:** `[CONFIRMAR COM A EQUIPE]` Definir formatos permitidos (PDF, JPG, PNG), tamanho máximo por arquivo, cota por jornada e política de exclusão/guarda (`Quadro 2` e `Quadro 13`).

### BL-12 · Configurador administrativo de formulários sem alterar código-fonte
- **Referência no SRS:** `RF27`, `RNF15`, `UI-07`, `Seção 4.6`
- **Prioridade:** 🟡 Média
- **Como está hoje:** Os formulários das 10 especialidades e suas condições (`showIf` em `conditionalEngine.ts`) estão definidos em componentes React no código, embora o banco já possua `Formulario`, `FormularioVersao`, `CampoFormulario` e `CampoOpcao`.
- **O que implementar no futuro:**
  - Implementar painel administrativo (`UI-07`) permitindo ao Administrador versionar formulários, incluir/ocultar perguntas, definir obrigatoriedade, ajustar opções pontuadas e configurar regras `showIf` sem editar código-fonte, preservando intactos os formulários antigos nas versões em que foram preenchidos.

### BL-13 · Armazenamento imutável no servidor dos PDFs/DOCX exportados
- **Referência no SRS:** `RF17`, `RF18`, `RN22`, `RN23`, `SW-06`
- **Prioridade:** 🟡 Média
- **Como está hoje:** A exportação PDF/DOCX ocorre no navegador com versionamento local, e a tabela `FichaConsolidada` já existe no banco, mas o documento gerado ainda não é arquivado no servidor.
- **O que implementar no futuro:**
  - Arquivar no servidor cada versão exportada (`FichaConsolidada` com `versao`, `gerada_por_id`, `criado_em` e `hash_arquivo`), assegurando que alterações posteriores na ficha gerem uma nova versão sem modificar exportações anteriores (`RN22`, `RN23`).

### BL-14 · Autocomplete com catálogos oficiais padronizados (CID, Unidades de Saúde e Sintomas)
- **Referência no SRS:** `RF22`, `Página 12`
- **Prioridade:** 🟡 Média
- **Como está hoje:** Os formulários contam com listas básicas estáticas, sem busca indexada completa na tabela oficial de CID ou rede de saúde.
- **O que implementar no futuro:**
  - Incorporar catálogos oficiais pesquisáveis por teclado (`RNF05`) para **CID-10 / CID-11 oncológicos**, **unidades de saúde de origem (SES-DF / Regulação)**, **tipos neoplásicos**, **sintomas padronizados** e **encaminhamentos**.
- **Pontos pendentes:** `[CONFIRMAR COM A EQUIPE]` Validar com a equipe multiprofissional os catálogos oficiais que alimentarão o preenchimento assistido (`Página 12 do SRS`).

### BL-15 · Notificações em tempo real entre Recepção, Especialidades e Coordenação
- **Referência no SRS:** `RF11`, `RF20`, `RF28` e `cronograma_sprints.md (Issue 5)`
- **Prioridade:** 🟡 Média
- **Como está hoje:** A atualização da fila entre computadores distintos depende de nova consulta/recarregamento.
- **O que implementar no futuro:**
  - Adicionar canal em tempo real (**WebSockets ou Server-Sent Events**) para notificar instantaneamente chegada do paciente na Recepção (`RF28`), conclusão de etapa para a próxima especialidade (`RN20`) e disparo de alertas **Nível 1 (Crítico)** ou **Nível 2 (Alto)**.

### BL-16 · Relatórios gerenciais históricos e exportação de indicadores para a Coordenação
- **Referência no SRS:** `RF23`, `RN25`, `UI-06`
- **Prioridade:** 🟡 Média
- **Como está hoje:** O painel `/dashboard/coordenacao` calcula métricas apenas para o dia corrente (`hoje`).
- **O que implementar no futuro:**
  - Criar filtros por intervalo de datas (semanal, mensal, anual), especialidade, CID e unidade de origem, exibindo evolução de tempo médio de espera, comparação com `meta_tempo_minutos`, formulários incompletos e gargalos recorrentes, com exportação agregada em **CSV/Excel e PDF**.

---

## 🤝 Épico 5 — Experiência do Paciente, Acompanhante e Sala de Espera

### BL-17 · Acesso seguro/tokenizado do Paciente e autorização formal do Acompanhante
- **Referência no SRS:** `RF03`, `RF13`, `RN05` a `RN09`, `UI-05`, `Seção 1.4.2`
- **Prioridade:** 🟢 Futura (Obrigatória antes de eventual abertura externa)
- **Como está hoje:** A consulta simplificada (`GET /pacientes/{id_ou_nome}/jornada`) aceita busca por nome, CPF ou código público, exibindo apenas etapas concluídas/pendentes sem dados clínicos sensíveis.
- **O que implementar no futuro:**
  - Exigir **código público da jornada + fator de verificação** (ex.: data de nascimento ou **QR Code individual entregue na Recepção**), impedindo busca aberta por nome de terceiros (`RNF08` — LGPD).
  - Formalizar na Recepção o termo/registro de **autorização do acompanhante** (`JornadaAcompanhante` — `RN08`), com possibilidade de revogação simples.
- **Pontos pendentes:** `[CONFIRMAR COM A EQUIPE]` Confirmar com a instituição se o acesso web simplificado para paciente/acompanhante será habilitado em produção e como funcionará o fluxo de autorização (`Seção 1.4.2`).

### BL-18 · Modo Painel / TV de Sala de Espera 100% Anonimizado
- **Referência no SRS:** `Seção 1.4.2`, `Seção 3.2`, `RNF08`
- **Prioridade:** 🟢 Futura
- **Como está hoje:** Não há visualização específica para televisores/monitores coletivos em sala de espera.
- **O que implementar no futuro:**
  - Caso aprovado pela unidade, disponibilizar tela de chamada coletiva exibindo **apenas a senha/código público da jornada** e a sala/especialidade, sem jamais exibir nome, documento ou diagnóstico (`Seção 1.4.2`).
- **Pontos pendentes:** `[CONFIRMAR COM A EQUIPE]` Confirmar se haverá uso de painéis ou TVs nos ambientes coletivos da UNACON.

### BL-19 · Orientações ao paciente por canais externos (WhatsApp / E-mail / SMS)
- **Referência no SRS:** `COM-05`, `RF13`, `Página 12` e `Página 29`
- **Prioridade:** 🟢 Futura
- **Como está hoje:** As orientações em linguagem simples são exibidas apenas na tela do sistema.
- **O que implementar no futuro:**
  - Se aprovado pelo HUB, implementar envio opcional de orientações gerais de próximos passos (sem dados clínicos sensíveis), mediante consentimento expresso registrado na Recepção.
- **Pontos pendentes:** `[CONFIRMAR COM A EQUIPE]` Definir se serão usados canais externos (WhatsApp institucional, e-mail, telefone) ou apenas orientação direta na plataforma/impresso (`COM-05`).

---

## ✅ 3. Checklist Consolidado de Decisões Pendentes (`[CONFIRMAR COM A EQUIPE]`)

Resumo executivo dos pontos do `SRSRequisitos.pdf` (páginas 11–12 e `Quadro 13`) que precisam de validação institucional antes da entrada em produção:

1. **Fluxo da Recepção e Navegação (`RN01`, `RN18`, `RF29`):** `[CONFIRMAR COM A EQUIPE]` O início da jornada será exclusivo da Recepção ou também permitido à Enfermagem/Navegação em situações autorizadas? Quais atribuições cabem exclusivamente à enfermeira navegadora/coordenação na antecipação de etapas e encerramento da jornada?
2. **Integração AGHU e Servidor Institucional (`SW-03`, `HW-04`, `COM-02`):** `[CONFIRMAR COM A EQUIPE]` Qual modalidade técnica a SETISD/Ebserh autoriza para comunicação com o AGHU (API, views de banco ou exportação assistida) e qual infraestrutura interna hospedará os containers de produção na intranet `hubrasil`?
3. **Política de Autenticação e Sessão (`SW-05`, `Quadro 13`):** `[CONFIRMAR COM A EQUIPE]` Integração com LDAP/Active Directory da Ebserh, tempo de expiração de sessão por inatividade e perfil de acesso de residentes/internos.
4. **Anexos, Backup e Retenção (`RF10`, `RNF17`, `Quadro 13`):** `[CONFIRMAR COM A EQUIPE]` Formatos e tamanhos máximos de documentos anexados, metas de disponibilidade/RTO/RPO e tempo de guarda legal de logs e arquivos.
5. **Paciente, Acompanhante e Comunicação Externa (`RN08`, `COM-05`, `Seção 1.4.2`):** `[CONFIRMAR COM A EQUIPE]` Aprovação institucional (LGPD/HUB) para consulta pelo celular via QR Code/código, fluxo de autorização do acompanhante, uso de TV anonimizada na recepção e eventual uso de WhatsApp/e-mail.

