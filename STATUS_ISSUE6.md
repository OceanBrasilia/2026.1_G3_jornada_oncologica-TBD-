# Diagnóstico da Issue 6 — Formulários, Ficha Consolidada e PDF

Data: 11/09/2026
Este arquivo é só um retrato do que existe hoje no código. Nada foi alterado para gerar este diagnóstico.

---

## 1. Tecnologia usada no front-end

- **Base**: React + Vite (moderno, comum, sem problema).
- **Visual**: Tailwind CSS. As cores da marca (azuis, etc.) estão escritas "na mão" (ex.: `#1B6CA8`) em vez de num lugar central — se um dia mudar a identidade visual, vai dar trabalho achar tudo.
- **Formulários**: existe uma biblioteca pronta para formulários (`react-hook-form`) instalada, mas **ela não é usada**. Cada formulário guarda os dados "na mão", campo por campo. Isso explica por que os condicionais (campo que aparece/some) são frágeis (ver item 4).
- **Geração de PDF**: **não existe uma biblioteca de PDF instalada.** O que existe hoje é o botão "Exportar PDF" da Ficha Consolidada usando o comando de **imprimir do navegador** (a pessoa clica, abre a caixa de impressão, e pode escolher "Salvar como PDF"). Funciona, mas não é um PDF gerado automaticamente pelo sistema — depende da pessoa saber escolher essa opção.
- **Testes automáticos**: **não existe nenhum** no front-end (nem ferramenta instalada, nem arquivo de teste). O back-end (parte do sistema que fica no servidor) tem testes, só o front-end não tem.

---

## 2. Onde está cada coisa

| O que | Onde | Situação resumida |
|---|---|---|
| Formulários de cada especialidade | `frontend/src/app/components/forms/` (um arquivo por especialidade: Enfermagem, Medicina, Fisioterapia, Fonoaudiologia, Nutrição, Odontologia, Psicologia, Serviço Social, Terapia Ocupacional) | Todos parecem ter os campos principais preenchidos, nenhum está "pela metade" no sentido de faltar seções inteiras |
| Cálculo do IMC | `frontend/src/app/utils/nutritionScoring.ts` | Existe e funciona, recalcula na hora. Só está disponível dentro do formulário de Nutrição |
| Cálculo da ASG-PPP | mesmo arquivo acima | É a parte **mais bem-feita** do sistema hoje: as 4 caixas de pontuação existem e calculam certo dentro do formulário de Nutrição |
| Cálculo do IRPO (as 27 perguntas de Psicologia) | dentro do próprio `PsicologiaForm.tsx` (não tem arquivo próprio) | As 27 perguntas existem, o cálculo do escore existe, e há um alerta quando o risco é alto. Funciona, mas fica "isolado" — não aparece em nenhum outro lugar do sistema (ver item 4) |
| Sistema de alertas (níveis 1 a 4 do documento de arquitetura) | `frontend/src/app/types/alerts.ts`, `components/ui/AlertBadge.tsx`, `components/ui/GlobalCriticalAlert.tsx` | Existe uma estrutura pronta, mas hoje ela roda **só com dados de exemplo (mock)**, não com dados reais digitados nos formulários |
| Campos condicionais (campo que aparece conforme a resposta) | espalhados em cada formulário individualmente | Funcionam na tela, mas cada um foi escrito "no braço", sem um padrão único (é exatamente o problema que o Passo 2 do seu kit pede para resolver) |
| Ficha Consolidada | dentro de `frontend/src/app/App.tsx`, tela `ConsolidatedRecordScreen` | **Já existe e já funciona**, reúne dados de todas as especialidades e até avisa quando duas especialidades preencheram algo diferente (ex.: peso diferente em duas fichas) |
| Botão Exportar PDF | também dentro de `App.tsx` | Existe **um botão que funciona de verdade** (na Ficha Consolidada, via impressão do navegador) e **outros dois botões que são só decoração** — mostram uma mensagem de "exportando..." mas não exportam nada |

---

## 3. Tabela de status por critério da Issue 6

| Critério | Status | Por quê |
|---|---|---|
| Todas as perguntas dos instrumentos de cada especialidade | 🟡 Parcial | Os formulários têm bastante coisa, mas ainda não comparamos pergunta por pergunta com os instrumentos oficiais do HUB (isso é o Passo 3 do seu kit — precisamos do PDF/texto original de cada instrumento). Além disso, o mesmo dado (ex.: "escolaridade") às vezes tem nome diferente em formulários diferentes, o que pode causar problema na Ficha Consolidada |
| ASG-PPP com escore automático e IMC dinâmico | 🟢 Feito (quase 100%) | Já calcula certo e em tempo real. Só uma sobrinha pequena: existe uma função pronta que mostra o texto de orientação por faixa de risco e ela não está sendo usada — fácil de ligar |
| IRPO de 27 itens com Índice Global de Risco e alertas | 🟡 Parcial | As 27 perguntas e o cálculo do risco **existem e funcionam**. O problema é que o alerta de risco fica preso dentro da tela de Psicologia — ele não aparece para o resto da equipe na Ficha Consolidada nem gera um alerta "oficial" no sistema (é um alerta "duplicado", separado do sistema de alertas geral) |
| Campos condicionais em Fisioterapia, TO, Serviço Social, Odontologia e Fono | 🟡 Parcial | Os campos aparecem/somem como deveriam, só que cada formulário resolve isso do seu próprio jeito, sem um padrão comum — é frágil (se mudar o texto de uma opção de resposta, o campo condicional pode quebrar sem avisar ninguém). É exatamente o que o Passo 2 do seu kit propõe resolver |
| Tela de Ficha Consolidada | 🟡 Parcial | A estrutura já existe e já mostra dados de todas as especialidades, mas hoje ela despeja os dados de forma "crua" (sem formatação bonita por especialidade) e não filtra o que cada perfil de usuário pode ver |
| Botão Exportar PDF | 🟡 Parcial | Funciona de verdade em um lugar (Ficha Consolidada, via impressão do navegador). Só que existem outros dois botões parecidos, em outras telas, que **não fazem nada** — isso pode confundir a equipe achando que já exportou algo |

---

## 4. Problemas encontrados

1. **Muito código repetido entre os 9 formulários.** O bloco de perguntas sobre tabagismo/etilismo, por exemplo, está copiado e colado em pelo menos 5 formulários diferentes. Já existem "peças prontas" para reaproveitar esse bloco, mas elas não estão sendo usadas ainda.
2. **Dois "alertas críticos" diferentes e desconectados.** A tela de Psicologia tem seu próprio aviso de risco (para ideação suicida, por exemplo), separado do sistema de alertas do resto do app. Um coordenador olhando a Ficha Consolidada de um paciente em risco não veria nenhum sinal disso fora da tela de Psicologia.
3. **O sistema de alertas hoje roda com dados de exemplo, não com dados reais.** Os alertas mostrados na tela vêm de uma lista fixa de exemplo, e não são gerados a partir do que a equipe realmente preenche nos formulários (IRPO, ASG-PPP, alergias, etc.).
4. **Os dados preenchidos nos formulários não são salvos de verdade ainda.** Atualizando a página, tudo o que foi digitado se perde — não existe uma conexão com o servidor para guardar as respostas dos formulários de especialidade. Esse é provavelmente o ponto mais importante para levar à equipe: os cálculos estão certos, mas nada fica salvo de fato.
5. **Nomes de campos inconsistentes entre especialidades** (ex.: "Escolaridade" num formulário e "grauEscolaridade" em outro, para a mesma informação). Isso dificulta reaproveitar dados entre especialidades e pode fazer a Ficha Consolidada comparar errado ou não comparar um dado que deveria comparar.
6. **Um campo com erro simples**: no formulário de Odontologia, o campo "Medicamentos" está sem ligação nenhuma com o dado — sempre aparece vazio, mesmo quando a Enfermagem já preencheu isso.
7. **Ainda não existem os 5 perfis de acesso** descritos no seu contexto (Paciente, Recepção, Equipe, Coordenação, Administrador) — hoje existem só 3 (Recepção, Profissional, Coordenação), e a escolha de perfil na tela de login não é verificada de verdade pelo sistema.
8. **Não existe filtro de confidencialidade por perfil.** Hoje, qualquer pessoa logada vê os mesmos alertas e os mesmos dados sensíveis — não há uma regra que esconda, por exemplo, informação de risco psicológico de quem não deveria ver.

---

## Resumo em uma frase

A parte "matemática" (IMC, ASG-PPP, IRPO) está mais avançada do que parecia e funciona bem visualmente — o trabalho que falta é principalmente **organizar e conectar** o que já existe: um único jeito de fazer campo condicional, um único sistema de alerta (hoje tem dois), salvar os dados de verdade no servidor, e decidir as regras de quem pode ver o quê.
