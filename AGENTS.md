# Contexto do projeto — Jornada Conectada (Acolhimento Oncológico HUB)

## Sobre quem está pedindo
Sou enfermeiro, atuo no front-end e tenho pouca experiência em programação.
- Explique o que vai fazer em linguagem simples ANTES de alterar código.
- Ao terminar, liste os arquivos alterados e diga como eu testo no navegador.
- Não reescreva arquivos inteiros quando uma alteração pontual resolve.
- Não apague código existente sem me mostrar o que será removido.
- Não instale dependências novas sem me perguntar e justificar.
- Se algo for decisão clínica ou institucional, NÃO invente: marque com [CONFIRMAR COM A EQUIPE] e me pergunte.

## O sistema
Webapp de acolhimento multiprofissional da Oncologia do Hospital Universitário
de Brasília. Funciona em computador, tablet e celular (larguras 360, 768, 1280
e 1920 px, sem perder funções essenciais — RNF-006).
Perfis: Paciente/Acompanhante (área simplificada), Recepção, Equipe
multiprofissional, Coordenação, Administrador.

## Regras do documento de requisitos que o front-end deve respeitar
- RF-004 / RNF-002: cada perfil vê só o que precisa. Esconder na tela não basta
  quando o dado é sensível; o dado não deve ser carregado para perfis sem permissão.
- RN-004: paciente/acompanhante vê apenas status e orientações simples. Nunca
  evoluções, escores, alertas internos ou dados clínicos detalhados.
- RF-006 / RF-009: campos compartilhados são pré-preenchidos e não duplicados.
- RF-020: alertas destacam a informação, mas NUNCA emitem decisão clínica automática.
- RF-021: todo cálculo automático mostra a fórmula ou referência e permite revisão humana.
- RF-025 / RNF-009: rascunho salvo automaticamente em até 30 s ou ao mudar de etapa.
- RF-017: a ficha consolidada reúne os dados autorizados e mostra data e hora de geração.
- RF-018: o PDF tem identificação do paciente, versão, data e conteúdo consolidado,
  e não altera exportações anteriores.
- RNF-007: acessibilidade. Todo campo tem rótulo, tudo funciona por teclado e
  nenhuma informação depende apenas da cor.

## Arquitetura de alertas (Nota Técnica do grupo)
- Nível 1 — Crítico: modal vermelho interruptivo. Só para perigo imediato. Exige ação ou justificativa.
- Nível 2 — Alto: faixa âmbar persistente no topo. Fica até o profissional registrar ciência ou plano.
- Nível 3 — Informativo: chips agrupados por eixo, com detalhes ao clicar:
  Risco Clínico/Funcional (verde), Acessibilidade/Comunicação (lilás),
  Dispositivos (azul), Risco Psicossocial (amarelo, visibilidade restrita).
- Nível 4 — Pendência: cartão de tarefa com responsável e prazo.
- Breakout: alergia grave, dor/sintoma intenso e suspeita de violência saem do chip e viram Nível 1 ou 2.
- Todo alerta mostra: título curto, motivo/origem, gravidade, ação recomendada,
  responsável, prazo, data/hora, autor e estado.
- Risco psíquico, violência, vulnerabilidade social e comunicação diagnóstica são
  CONFIDENCIAIS: nunca aparecem no portal do paciente nem para o acompanhante.
- Linguagem não estigmatizante: "barreira de transporte relatada", e não "paciente sem suporte".

## Padrão para campos condicionais
- As condições ficam declaradas na configuração do formulário (ex.: `showIf`),
  e não espalhadas em `if` dentro das telas.
- Campo escondido: valor limpo, não obrigatório, fora da validação e fora da ficha consolidada.
