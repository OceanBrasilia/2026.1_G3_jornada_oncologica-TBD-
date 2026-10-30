# Status da Issue 6 — Formulários, Ficha Consolidada e PDF

Última atualização: 11/09/2026 (revisão final, Passo 7)

Este arquivo documenta o estado do trabalho ao final da Issue 6. A versão
original (diagnóstico do Passo 0) descrevia o que já existia antes de
qualquer alteração; esta versão reflete o que foi feito durante os Passos
1 a 7.

---

## 1. Status de cada critério de aceitação

| Critério | Status | Detalhe |
|---|---|---|
| Cálculos de IMC, ASG-PPP e IRPO revisados e testados | 🟢 Feito | Extraídos para `frontend/src/app/calculos/` (funções puras), com 39 testes automatizados. Regras de pontuação não foram alteradas. |
| Motor único de campos condicionais | 🟢 Feito | `frontend/src/app/components/forms/shared/ConditionalField.tsx`, aplicado nos 9 formulários de especialidade (não só os 5 originalmente previstos). |
| Perguntas faltantes dos instrumentos | ⚪ Fora do escopo desta rodada | Usuário confirmou que o conteúdo das perguntas já está correto/validado — não foi comparado com os PDFs originais nesta Issue. |
| Alertas do IRPO/ASG-PPP na arquitetura de 4 níveis | 🟢 Feito | Nível 2 (faixa) e Nível 4 (pendência) implementados do zero — só existiam no papel. Escopo ampliado a pedido do usuário: também cobre dispositivos, comorbidades, alergia, dor, acessibilidade/comunicação e vulnerabilidade social. |
| Confidencialidade por perfil | 🟢 Feito | Ponto único de decisão (`frontend/src/app/alerts/visibleAlerts.ts`), aplicado em alertas e nos dados da Ficha Consolidada/Resumo/PDF. Só `profissional` e `coordenacao` veem conteúdo confidencial. |
| Tela de Ficha Consolidada (RF-017) | 🟢 Feito | Reformulada: todas as especialidades aparecem com status, dados compartilhados sem repetição, resultados calculados (IMC/ASG-PPP/IRPO) em vez de respostas brutas, campos condicionais escondidos somem da leitura, confidencialidade respeitada, data/hora real de geração. |
| Exportar PDF (RF-018) | 🟢 Feito | PDF real (texto selecionável), com cabeçalho, versão, data/hora, profissional, numeração de página, rodapé fixo, nome de arquivo no formato pedido, sem o nome do paciente. Os 3 botões de exportar do sistema (Ficha Consolidada, cabeçalho do paciente, cada especialidade) geram o mesmo documento. |
| RNF-006 (360/768/1280/1920 px) | 🟢 Feito | Testado com Playwright nas 4 larguras. Encontrado e corrigido um bug real de rolagem horizontal na página inteira (faltava `min-w-0` no container principal). |
| Navegação por teclado | 🟢 Verificado | Tab percorre os elementos, foco visível, funciona dentro dos formulários. |
| Reaproveitamento de dados entre especialidades (RF-006/RF-009) | 🟢 Feito | Ver item 3 abaixo — vários bugs de dado duplicado/colidindo corrigidos. |

---

## 2. O que foi feito, por passo

- **Passo 1** — Cálculos de IMC/ASG-PPP/IRPO extraídos e testados (`frontend/src/app/calculos/`).
- **Passo 2** — Motor de campos condicionais (`ConditionalField`), aplicado nos 9 formulários.
- **Passo 3** — Não realizado nesta Issue (conteúdo das perguntas já validado pelo usuário).
- **Passo 4** — Arquitetura de alertas de 4 níveis implementada (Nível 2 e 4 não existiam antes), cobrindo IRPO, ASG-PPP, dor, alergia, dispositivos, comorbidades, acessibilidade/comunicação (novo) e vulnerabilidade social (novo, sinalização manual do Serviço Social).
- **Passo 5** — Ficha Consolidada reformulada nos 7 pontos pedidos.
- **Passo 6** — Exportação real de PDF com `@react-pdf/renderer`, carregada sob demanda (não pesa o carregamento inicial do app).
- **Passo 7** — Revisão final: sem erros novos no console, larguras testadas e um bug de rolagem horizontal corrigido, navegação por teclado confirmada, e mais dois bugs de dado colidindo entre especialidades corrigidos (ver item 3).

---

## 3. Reaproveitamento de dados — bugs encontrados e corrigidos

Levantamento feito a pedido do usuário: perguntas que representam o mesmo
conceito, mas foram implementadas com tipo de campo diferente entre
especialidades (checkbox, texto, seleção).

**Consistentes, sem problema:** Comorbidades, Alergia, Reação alérgica,
Tabagismo/Etilismo, Escolaridade, Estado civil, Sexo, Medicações,
Diagnóstico, Peso, Altura.

**Corrigidos nesta Issue:**
1. Medicamentos: Odontologia e Fonoaudiologia não liam o dado real da
   Enfermagem (um tinha o campo sem ligação nenhuma; o outro tinha um
   valor fixo inventado no código, "Losartana 50 mg").
2. Divergência na Ficha Consolidada: a lista de campos verificados usava
   2 nomes que não existiam em nenhum formulário — a checagem nunca
   disparava para esses campos.
3. **"Ocupação/Trabalho" estava triplicado e colidindo**: um bloco
   compartilhado (usado por todas as 9 especialidades) já pergunta a
   situação profissional; a Enfermagem tinha a mesma pergunta duplicada
   por engano; Odontologia e Serviço Social usavam a mesma chave de dado
   para perguntar a profissão em si (texto livre) — ou seja, a mesma
   informação por baixo dos panos tinha três formas diferentes e
   incompatíveis de ser preenchida. Corrigido: pergunta duplicada da
   Enfermagem removida; Odontologia/Serviço Social passaram a usar uma
   chave própria ("Profissão"), separada da situação profissional.

**Decisão do usuário, não unificado de propósito:** Renda familiar
(Nutrição, Serviço Social e Terapia Ocupacional perguntam com
granularidades diferentes — 3, 5 e 4 faixas). Em vez de unificar,
Nutrição e Terapia Ocupacional agora fazem autocomplete a partir da
resposta do Serviço Social (fonte de referência para dado
socioeconômico), traduzindo para a opção mais próxima da lista local —
e continuam totalmente editáveis.

---

## 4. Pendências e o que depende de decisão da equipe

1. **[CONFIRMAR COM A EQUIPE] Persistência real dos dados.** Os
   formulários ainda não salvam no back-end — os dados se perdem ao
   atualizar a página. Não fazia parte do escopo desta Issue, mas é o
   maior risco para uso em produção.
2. **[CONFIRMAR COM A EQUIPE] Pontos de corte dos alertas** (dor ≥ 8,
   ASG-PPP ≥ 4, regra do IRPO). Ficam num único arquivo
   (`frontend/src/app/config/alertThresholds.ts`), fáceis de ajustar,
   mas ainda não foram validados clinicamente pela equipe.
3. **[CONFIRMAR COM A EQUIPE] Acesso por perfil de conteúdo confidencial.**
   Hoje só `profissional`/`coordenacao` veem; `recepcao` nunca vê. Regra
   de partida, documentada, sujeita a revisão.
4. **[CONFIRMAR COM A EQUIPE] Regras de tipo de dado pra alinhar com o
   Back-end/banco** — ver item 3 acima e a tabela de reaproveitamento de
   dados enviada durante a revisão (Comorbidades ok; Ocupação/Profissão
   corrigido nesta Issue; Renda em 3 granularidades diferentes,
   propositalmente não unificada).
5. Os 5 perfis de acesso descritos no contexto do projeto (Paciente,
   Recepção, Equipe, Coordenação, Administrador) ainda não existem —
   hoje são só 3 (Recepção, Profissional, Coordenação). Fora do escopo
   desta Issue.
6. Suspeita de violência e "vulnerabilidade social" automática (por
   combinação de outros campos) não foram implementadas — a
   vulnerabilidade social virou uma sinalização manual da equipe de
   Serviço Social, por decisão do usuário (evita inventar uma regra
   clínica automática).
7. Erro de CORS ao fazer login contra o back-end real (`localhost:8001`)
   — o app segue funcionando com dados simulados, mas esse erro aparece
   no console. Não é um problema desta Issue (é integração
   frontend/backend), só fica registrado aqui para o time saber.

---

## Resumo em uma frase

Os 6 passos técnicos da Issue 6 (cálculos, condicionais, alertas, ficha
consolidada, PDF) foram concluídos e testados; o reaproveitamento de
dados entre especialidades foi auditado e três bugs reais de dado
colidindo foram corrigidos — o que falta agora é validação clínica dos
pontos de corte pela equipe e, fora do escopo desta Issue, a persistência
real dos dados no back-end.
