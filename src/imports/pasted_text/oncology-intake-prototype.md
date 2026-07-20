Crie um protótipo de website responsivo para uma plataforma chamada “Central de Acolhimento Oncológico”.

Contexto do produto:
A plataforma será usada no acolhimento multiprofissional de pacientes oncológicos em ambiente hospitalar. O objetivo é reduzir a fragmentação das informações, evitar repetição de perguntas ao paciente, organizar os formulários por especialidade e permitir que o paciente ou acompanhante visualize apenas o andamento da jornada de atendimento.

Objetivo principal:
Criar uma interface web responsiva, clara, acessível e humanizada para centralizar a jornada de acolhimento oncológico.

Públicos do sistema:

1. Recepção:

* Cadastra o paciente.
* Gera ou consulta o ID único do paciente.
* Registra a chegada do paciente.
* Inicia a jornada de acolhimento.
* Anexa documentos ou exames, quando necessário.

2. Profissionais de saúde:

* Acessam a lista de pacientes em acolhimento.
* Visualizam dados já registrados por outras áreas, conforme permissão.
* Preenchem formulários específicos da sua especialidade.
* Reutilizam campos comuns já preenchidos, como peso, altura, diagnóstico, CID, telefone, escolaridade e composição familiar.
* Registram observações, condutas ou evolução da especialidade.
* Finalizam a etapa da especialidade.

3. Coordenação:

* Visualiza painel geral com todos os pacientes em acolhimento.
* Acompanha status da jornada.
* Identifica especialidades pendentes.
* Visualiza gargalos e andamento geral do fluxo.

4. Paciente ou acompanhante:

* Não insere dados.
* Não acessa informações clínicas sensíveis.
* Pode pesquisar pelo nome, ID ou outro dado autorizado.
* Visualiza apenas a jornada do paciente, mostrando quais especialidades já atenderam e quais ainda estão pendentes.

Estrutura de telas desejada:

1. Tela de login

* Visual limpo e institucional.
* Campos de e-mail/usuário e senha.
* Opções de acesso por perfil: profissional, recepção, coordenação.
* Link separado para “Consultar jornada do paciente”.

2. Tela de consulta da jornada do paciente

* Campo de busca por nome ou ID do paciente.
* Resultado com nome do paciente, código/ID e data do acolhimento.
* Linha do tempo ou cards com as especialidades.
* Cada especialidade deve ter status visual:

  * Atendido
  * Pendente
  * Em atendimento
  * Não se aplica
* Não exibir dados sensíveis, condutas clínicas, observações internas ou formulários.
* Linguagem simples e acolhedora.
* Exemplo de mensagem: “Veja abaixo quais etapas do seu acolhimento já foram concluídas.”

3. Dashboard da recepção

* Lista de pacientes do dia.
* Botão “Novo paciente”.
* Botão “Registrar chegada”.
* Cards com status: aguardando, em atendimento, pendente e finalizado.
* Busca por nome, ID ou data.
* Ação para abrir ficha do paciente.
* Área para anexar documentos/exames.

4. Cadastro inicial do paciente

* Formulário com dados básicos:

  * Nome completo
  * Data de nascimento
  * CPF ou CNS
  * Telefone
  * Endereço
  * Contato de emergência
  * Acompanhante
  * Diagnóstico inicial
  * CID
  * Unidade de origem
* Após salvar, exibir ID único do paciente.
* Botão para iniciar jornada de acolhimento.

5. Dashboard da equipe multiprofissional

* Lista de pacientes em acolhimento.
* Filtros por especialidade, status, tempo de espera e pendências.
* Cards com indicadores:

  * Pacientes aguardando
  * Pacientes em atendimento
  * Especialidades pendentes
  * Atendimentos finalizados
* Cada linha da tabela deve mostrar:

  * Nome do paciente
  * ID
  * Diagnóstico ou tipo de atendimento
  * Especialidades concluídas
  * Especialidades pendentes
  * Ação “Abrir jornada”

6. Tela da ficha/jornada do paciente para profissionais

* Cabeçalho com dados gerais do paciente:

  * Nome
  * ID
  * Idade
  * Diagnóstico
  * CID
  * Status geral
* Linha do tempo da jornada com especialidades.
* Abas por especialidade:

  * Recepção
  * Enfermagem
  * Medicina
  * Nutrição
  * Fisioterapia
  * Serviço Social
  * Psicologia
  * Odontologia
  * Fonoaudiologia
* Área de resumo consolidado.
* Botão “Gerar ficha consolidada”.
* Botão “Exportar PDF”.

7. Tela de formulário por especialidade

* Layout dividido em seções.
* Campos comuns já preenchidos automaticamente quando existirem em outros formulários.
* Mostrar indicação visual de campo reaproveitado, por exemplo: “Dado já registrado pela Nutrição”.
* Campos específicos da especialidade.
* Campo de observações/evolução.
* Botões:

  * Salvar rascunho
  * Finalizar atendimento
  * Marcar como não se aplica
* Exemplo para Nutrição:

  * Peso
  * Altura
  * IMC calculado automaticamente
  * Risco nutricional
  * Uso de sonda/gastrostomia
  * Observações nutricionais
* Exemplo para Fisioterapia:

  * Dor
  * Mobilidade
  * Limitação funcional
  * Necessidade de reabilitação
  * Observações funcionais

8. Tela de ficha consolidada

* Resumo limpo e organizado das informações coletadas.
* Divisão por blocos:

  * Dados gerais
  * Dados clínicos iniciais
  * Dados sociais relevantes
  * Avaliações por especialidade
  * Pendências e encaminhamentos
* Botão “Exportar PDF”.
* Indicar data e horário da geração da ficha.

Estilo visual:

* Interface hospitalar, moderna, acolhedora e confiável.
* Design limpo, com bastante espaço em branco.
* Usar cores suaves, como azul, verde ou tons neutros.
* Evitar aparência pesada ou excessivamente clínica.
* Tipografia legível.
* Cards com cantos arredondados.
* Ícones simples para especialidades, status, documentos e jornada.
* Usar badges de status com cores diferentes:

  * Verde para atendido
  * Amarelo para pendente
  * Azul para em atendimento
  * Cinza para não se aplica
* Design acessível, com bom contraste e botões grandes.

Requisitos de responsividade:

* Criar versão desktop e mobile.
* No mobile, priorizar cards ao invés de tabelas largas.
* A jornada do paciente deve funcionar bem no celular.
* Os formulários profissionais devem ser fáceis de preencher em tablet ou computador.
* Menus devem ser simples e colapsáveis em telas menores.

Regras importantes:

* Paciente e acompanhante não podem editar dados.
* Paciente e acompanhante não podem visualizar dados sensíveis.
* O foco do paciente é apenas acompanhar a jornada por especialidade.
* Profissionais visualizam e editam apenas informações permitidas ao seu perfil.
* Campos comuns devem ser compartilhados entre formulários.
* A plataforma não substitui o prontuário oficial; ela apoia o acolhimento e a consolidação das informações.

Entregue o protótipo com telas bem organizadas, componentes reutilizáveis, cards, tabelas, formulários, badges de status, menu lateral para profissionais e uma interface simplificada para paciente/acompanhante.
