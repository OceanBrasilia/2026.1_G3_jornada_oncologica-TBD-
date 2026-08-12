# Jornada Oncológica - Stack de Desenvolvimento

Este repositório contém a aplicação **Jornada Oncológica** configurada como uma arquitetura monorepo baseada em microsserviços rodando em Docker.

## 🏗️ Estrutura do Repositório

O projeto é dividido em três partes principais:

1. **Frontend (`/frontend`)**: Interface rica e moderna desenvolvida com React, Vite, Tailwind CSS v4, Radix UI e Motion.
2. **Backend (`/backend`)**: API REST desenvolvida em Python com **FastAPI**, utilizando **SQLAlchemy** como ORM para comunicação com o banco de dados.
3. **Banco de Dados**: Instância do **PostgreSQL** orquestrada localmente para desenvolvimento offline.

---

## 🛠️ Pré-requisitos

Para rodar a aplicação localmente de forma simplificada, você precisará apenas de:
- **Docker** e **Docker Compose** instalados na sua máquina.

---

## 🚀 Como Executar o Projeto com Docker

Siga as etapas abaixo para subir a aplicação inteira (Frontend + Backend + Banco de Dados):

1. **Crie o arquivo de configuração local:**
   O arquivo `.env` já vem pré-configurado por padrão. Se precisar customizar, você pode utilizar o `.env.example` como base:
   ```bash
   cp .env.example .env
   ```

2. **Suba os containers:**
   Execute o comando a seguir na raiz do repositório:
   ```bash
   docker compose up --build
   ```
   *Nota: O Docker irá baixar as imagens necessárias, instalar as dependências de Node e Python e iniciar os servidores.*

3. **Acesse as aplicações:**
   - **Frontend (Web):** [http://localhost:5173](http://localhost:5173)
   - **Backend (API):** [http://localhost:8001](http://localhost:8001)
   - **Documentação Interativa (Swagger):** [http://localhost:8001/docs](http://localhost:8001/docs) (para testar os endpoints da API visualmente).

---

## 🔌 Conexão com o Banco de Dados da VM (Projeto Ocean / AGHU)

Caso você queira testar a aplicação conectando-a diretamente à base de dados de homologação hospedada na VM externa:

1. Certifique-se de estar conectada à rede **hubrasil** dentro da estrutura do HUB.
2. Abra o arquivo `.env` localizado na raiz do projeto.
3. Comente a linha de `DATABASE_URL` local e descomente/configure a linha correspondente à VM externa:
   ```env
   # DATABASE_URL local (Docker)
   # DATABASE_URL=postgresql://postgres:postgres@db:5432/jornada_db

   # DATABASE_URL externa (VM)
   DATABASE_URL=postgresql://usuario:senha@ip_da_vm:porta/nome_do_banco
   ```
4. Reinicie os containers com `docker compose down` e `docker compose up`. O backend se conectará automaticamente à VM externa.

---

## 💻 Desenvolvimento Local Sem Docker (Opcional)

Se preferir rodar as partes individualmente fora do Docker:

### Frontend (Vite + React)
Certifique-se de ter o Node.js e o `pnpm` (ou `npm`) instalados.
```bash
cd frontend
pnpm install
pnpm run dev
```

### Backend (FastAPI + Python)
Certifique-se de ter o Python 3.11+ instalado.
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # No Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
