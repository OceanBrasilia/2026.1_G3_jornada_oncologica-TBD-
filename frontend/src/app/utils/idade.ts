/**
 * Idade em anos completos a partir da data de nascimento ("AAAA-MM-DD").
 *
 * Lê ano, mês e dia direto do texto, sem `new Date("AAAA-MM-DD")`, porque o
 * navegador interpreta esse formato como meia-noite UTC e, no horário de
 * Brasília, a data vira o dia anterior (erra a idade na véspera do aniversário).
 *
 * Retorna 0 quando a data está vazia ou é inválida.
 */
export function calcularIdade(dataNascimento?: string | null, hoje: Date = new Date()): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dataNascimento ?? "");
  if (!match) return 0;
  const [ano, mes, dia] = [Number(match[1]), Number(match[2]), Number(match[3])];

  let idade = hoje.getFullYear() - ano;
  const mesAtual = hoje.getMonth() + 1;
  if (mesAtual < mes || (mesAtual === mes && hoje.getDate() < dia)) idade--;
  return Math.max(0, idade);
}
