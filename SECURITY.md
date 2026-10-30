# Segurança e dados de saúde

GitHub não é um repositório de dados clínicos identificáveis. Repositórios privados também seguem esta regra.

Permitidos: schemas (descrições da estrutura dos dados), exemplos fictícios, fixtures (dados de teste), amostras sintéticas e dados anonimizados com autorização institucional.

Nunca incluir prontuários, nomes ou identificadores de pacientes, CPF, exports de sistemas hospitalares, dados clínicos reais não autorizados, senhas, tokens, chaves privadas, arquivos .env com segredos ou kubeconfigs funcionais.

Antes de enviar arquivos, revise conteúdo, imagens, anexos e histórico. A verificação automática é básica e não substitui revisão humana.

Se encontrar uma exposição: interrompa o compartilhamento, avise a coordenação por canal privado e revogue a credencial imediatamente. Não abra Issue com o dado sensível. Apagar o arquivo do último commit não o remove do histórico; a infraestrutura deve avaliar limpeza e cópias existentes.

Qualquer mudança de privado para público exige decisão institucional registrada. Não exponha e-mails pessoais nos READMEs.
