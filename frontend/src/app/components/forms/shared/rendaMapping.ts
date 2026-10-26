/**
 * O Serviço Social é a referência ("padrão ouro") para dados socioeconômicos,
 * mas cada especialidade pergunta a renda com sua própria granularidade
 * (propósito diferente). Estas funções traduzem a resposta do Serviço Social
 * para a opção mais próxima da lista de cada especialidade, para uso como
 * autocomplete (o profissional pode sempre alterar depois).
 *
 * [CONFIRMAR COM A EQUIPE] Casos de fronteira (ex.: "3 a 5 salários mínimos",
 * que cobre duas faixas da Nutrição) foram resolvidos pela aproximação mais
 * conservadora — ajustar se a equipe preferir outro critério.
 */

// Serviço Social -> Nutrição ("Renda familiar")
const SERVICO_SOCIAL_PARA_NUTRICAO: Record<string, string> = {
  "Sem renda": "1 a 2 salários",
  "Menos de 1 salário mínimo": "1 a 2 salários",
  "Até 1 Salário Mínimo": "1 a 2 salários",
  "Até 1 salário mínimo": "1 a 2 salários",
  "1 Salário Mínimo": "1 a 2 salários",
  "1 a 2 salários mínimos": "1 a 2 salários",
  "1,2 a 3 Salários Mínimos": "1 a 2 salários",
  "3 a 5 salários mínimos": "3 a 4 salários",
  "Acima de 3 Salários Mínimos": "3 a 4 salários",
  "Mais de 5 salários mínimos": "Mais de 4 salários",
};

// Serviço Social -> Terapia Ocupacional ("Renda atual")
const SERVICO_SOCIAL_PARA_TO: Record<string, string> = {
  "Sem renda": "Sem renda",
  "Menos de 1 salário mínimo": "Até 1 salário mínimo",
  "Até 1 Salário Mínimo": "Até 1 salário mínimo",
  "Até 1 salário mínimo": "Até 1 salário mínimo",
  "1 Salário Mínimo": "Até 1 salário mínimo",
  "1 a 2 salários mínimos": "De 1 a 3 salários mínimos",
  "1,2 a 3 Salários Mínimos": "De 1 a 3 salários mínimos",
  "3 a 5 salários mínimos": "Mais de 3 salários mínimos",
  "Acima de 3 Salários Mínimos": "Mais de 3 salários mínimos",
  "Mais de 5 salários mínimos": "Mais de 3 salários mínimos",
};

export function mapRendaServicoSocialParaNutricao(valor: string): string {
  return SERVICO_SOCIAL_PARA_NUTRICAO[valor] ?? valor;
}

export function mapRendaServicoSocialParaTerapiaOcupacional(valor: string): string {
  return SERVICO_SOCIAL_PARA_TO[valor] ?? valor;
}
