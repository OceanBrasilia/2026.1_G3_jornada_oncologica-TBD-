# 🧪 Guia Completo de Testes e Usabilidade — Jornada Conectada (HUB)

Este documento orienta qualquer membro da equipe ou avaliador a **executar o sistema do zero** e realizar o **teste de usabilidade e funcionalidade** passo a passo no navegador.

---

## 🚀 1. Como Rodar o Sistema do Zero

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **Python** (versão 3.11 ou 3.12)
- Navegador moderno (Google Chrome, Microsoft Edge ou Firefox)

---

### Passo 1: Iniciar o Back-end (FastAPI)
Abra um terminal (PowerShell ou Bash) na pasta do projeto:

```powershell
cd software/backend
# Criar/ativar o ambiente virtual (caso use)
python -m venv venv
.\venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Iniciar o servidor backend na porta 8000
uvicorn app.main:app --reload --port 8000
```
> O backend estará acessível em: `http://localhost:8000` (documentação Swagger em `http://localhost:8000/docs`).

---

### Passo 2: Iniciar o Front-end (React + Vite)
Abra um **segundo terminal** na pasta do projeto:

```powershell
cd software/frontend

# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```
> O front-end estará acessível no seu navegador em: **`http://localhost:5173/`**

---

### Passo 3: Executar os Testes Automatizados (Opcional)
Se desejar verificar a integridade antes de navegar:

- **Testes do Front-end (121 testes)**:
  ```powershell
  cd software/frontend
  npm run test
  ```
- **Testes do Back-end (74 testes)**:
  ```powershell
  cd software/backend
  pytest
  ```

---

## 🧭 2. Roteiro Prático de Teste de Usabilidade no Navegador

Abra o navegador em **`http://localhost:5173/`** e siga os 6 cenários abaixo:

---

### 🔹 Cenário 1: Perfil de Administrador e Gestão de Profissionais
**Objetivo**: Validar o cadastro e gerenciamento de médicos, enfermeiros e equipes.

1. Na barra superior (cabeçalho), no seletor de perfil, escolha **Administrador** (`administrador`).
2. No menu lateral esquerdo, clique em **"Gestão de Profissionais"**.
3. Clique no botão azul **"+ Novo Profissional"**.
4. Preencha o nome (ex.: `Dra. Juliana Santos`), especialidade (`Medicina`), conselho/registro (`CRM/DF 12345`) e salve.
5. Verifique se o profissional recém-cadastrado aparece imediatamente na lista e teste o botão de edição.

---

### 🔹 Cenário 2: Preenchimento de Ficha e Salvamento com F5 (Enfermagem)
**Objetivo**: Validar a facilidade de preenchimento e a proteção contra perda de dados (auto-save).

1. No cabeçalho, alterne o perfil para **Equipe Multiprofissional** (ou Enfermagem).
2. Na lista de pacientes, clique em um paciente (ex.: **Maria Silva**).
3. Na jornada do paciente, clique na etapa de **Enfermagem**.
4. Preencha os seguintes campos de teste:
   - **Pressão Arterial**: `130x85`
   - **Frequência Cardíaca**: `78`
   - **Alergia**: Selecione `Sim` (observe que o campo *"Reação alérgica"* aparece automaticamente de forma condicional).
   - **Reação alérgica**: Digite `Dipirona - Placas vermelhas na pele`.
   - **Avaliação da Dor**: Marque a nota `8` (dor intensa).
5. **Pressione a tecla F5 no teclado** para recarregar a página.
6. Volte à ficha da Enfermagem: **observe que todos os dados digitados permanecem intactos** graças ao salvamento automático de rascunho.
7. Role até o final e clique em **"Salvar e Finalizar Etapa"**.
8. Observe o topo da tela: um alerta persistente de **Dor Intensa (Nível 2)** foi gerado com ação recomendada e responsável clínico.

---

### 🔹 Cenário 3: Herança de Dados Compartilhados (Nutrição / Medicina)
**Objetivo**: Validar o reaproveitamento de dados entre especialidades sem retrabalho (RF-006 / RF-009).

1. Ainda no mesmo paciente (**Maria Silva**), clique para abrir o formulário de outra especialidade (ex.: **Nutrição** ou **Medicina**).
2. Role até a seção de **Sinais Vitais**, **Comorbidades** ou **Alergias**.
3. Verifique que:
   - Os dados preenchidos pela Enfermagem (`130x85`, `78 bpm`, `Dipirona`) já aparecem **automaticamente pré-preenchidos**.
   - Existe uma tag/etiqueta visual indicando a origem dos dados (ex.: *"Origem: Enfermagem"*).
4. Isso comprova que os profissionais não precisam redigitar informações básicas.

---

### 🔹 Cenário 4: Ficha Consolidada e Exportação em PDF
**Objetivo**: Validar a reunião dos dados clínicos em documento único com carimbo de data/hora.

1. No menu lateral ou na barra do paciente, clique em **"Ficha Consolidada"**.
2. Verifique o cabeçalho com identificação do paciente, data e hora da geração e os blocos de cada especialidade preenchida.
3. Clique no botão **"Exportar PDF"**.
4. O arquivo PDF será baixado com o nome padronizado (ex.: `ficha_maria-silva_14092026.pdf`). Abra o PDF e confira a formatação limpa.

---

### 🔹 Cenário 5: Consulta Pública de Jornada (Paciente / Acompanhante)
**Objetivo**: Validar a humanização e a segurança da informação para o público geral (RF-004 e RN-004).

1. No topo, clique em **"Sair"** ou alterne o perfil para **"Consulta Pública de Jornada"** (ou clique no link *"Consultar jornada do paciente →"* na tela inicial).
2. Na barra de pesquisa, digite o nome `Maria Silva` (ou o código do paciente).
3. Na tela de resultado, observe:
   - ✅ Aparece uma linha do tempo clara e acolhedora com as etapas concluídas e próximas orientações.
   - 🛡️ **NENHUM dado clínico confidencial é exibido** (sem escores numéricos, sem notas de risco psicossocial e sem anotações médicas internas).

---

### 🔹 Cenário 6: Teste de Acessibilidade e Responsividade (Celular / Teclado)
**Objetivo**: Validar a conformidade com as normas RNF-006 e RNF-007.

1. **Responsividade Mobile (360px) e Tablet (768px)**:
   - No navegador, pressione `F12` e clique no ícone de visualização em dispositivos móveis (ou redimensione a janela).
   - Configure a largura para **360px** (tamanho padrão de smartphone).
   - Verifique que o menu lateral se recolhe automaticamente e os botões continuam grandes e fáceis de tocar.
2. **Navegação por Teclado**:
   - Sem usar o mouse, use a tecla **`Tab`** para navegar pelos campos e botões.
   - Pressione **`Enter`** ou **`Espaço`** para abrir menus e selecionar opções.
   - Verifique que o foco visual (borda destacada) acompanha perfeitamente onde você está.
3. **Não-dependência de Cores**:
   - Observe os alertas na tela: todos contam com **ícones representativos e textos claros**, permitindo a compreensão mesmo para usuários com daltonismo.

---

## 📞 Dúvidas ou Sugestões da Equipe
Caso encontre qualquer ponto que necessite de ajuste ou decisão clínica, registre o item indicando `[CONFIRMAR COM A EQUIPE]`.
