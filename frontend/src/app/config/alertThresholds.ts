/**
 * Pontos de corte que definem o nível de cada alerta clínico (Passo 4 da
 * Issue 6). Ficam todos aqui, num único lugar, para serem fáceis de ajustar.
 *
 * [CONFIRMAR COM A EQUIPE] Os valores abaixo foram definidos junto com o
 * usuário responsável pelo front-end como ponto de partida, seguindo a
 * arquitetura de alertas descrita no AGENTS.md. Ainda precisam de validação
 * clínica formal da equipe (Psicologia, Nutrição, Enfermagem) antes de valer
 * como regra definitiva do HUB.
 *
 * Os pontos de corte que definem o ESCORE em si (ex.: faixas do IRPO e da
 * ASG-PPP) ficam em frontend/src/app/calculos/irpo.ts e asgPpp.ts — aqui só
 * decidimos qual NÍVEL DE ALERTA cada classificação já calculada dispara.
 */

/** Dor referida (escala 0-10) a partir da qual vira alerta de Nível 2 (breakout, RN da Nota Técnica: "dor/sintoma intenso"). */
export const DOR_INTENSA_NIVEL_2 = 8;

/** Escore total da ASG-PPP a partir do qual passa a indicar necessidade de intervenção nutricional (Nível 2 + pendência para Nutrição). Abaixo disso, vira só um chip informativo (Nível 3). */
export const ASG_PPP_NIVEL_2 = 4;

/**
 * IRPO: só ideação suicida ativa (questão 28 = "Sim") gera o Modal Crítico
 * (Nível 1). Um Índice Global de Risco alto (≥ 70) SEM ideação suicida ativa
 * gera Nível 2 (faixa persistente) + pendência para a Psicologia, não mais
 * o modal interruptivo — corrige o comportamento anterior, que tratava os
 * dois casos da mesma forma.
 */
export const IRPO_NIVEL1_EXIGE_IDEACAO_SUICIDA = true;
