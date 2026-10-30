# Software — Jornada Oncológica

Aqui ficam o código-fonte e os arquivos de configuração local da aplicação. Documentos de pesquisa e requisitos ficam em [docs/](../docs/README.md) e instruções de infraestrutura em [deploy/](../deploy/README.md).

## Estrutura

- **`software/frontend/`**: Interface web desenvolvida com React, TypeScript, Vite, Tailwind CSS v4, Radix UI e `@react-pdf/renderer`.
- **`software/backend/`**: API REST em Python 3.11+ com FastAPI, SQLAlchemy, Alembic e PostgreSQL.
- **`software/env.example`**: Exemplo de variáveis de ambiente locais (copie para `.env` na raiz caso precise customizar; nunca versione arquivos `.env`).

## Execução com Docker Compose (Recomendado)

Na raiz do repositório:

```bash
cp software/env.example .env   # opcional; os padrões já funcionam localmente
docker compose up --build
```

- **Frontend:** http://localhost:5173
- **Backend (API):** http://localhost:8001
- **Swagger:** http://localhost:8001/docs

## Execução sem Docker (Desenvolvimento Local)

### Backend (FastAPI + Python 3.11+)

```bash
cd software/backend
python -m venv .venv
# Linux/macOS: source .venv/bin/activate | Windows: .\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend (Vite + React + Node.js 20+)

```bash
cd software/frontend
npm install
npm run dev
```

## Testes Automatizados

- **Frontend (Vitest):**
  ```bash
  cd software/frontend
  npm run test
  ```
- **Backend (Pytest):**
  ```bash
  cd software/backend
  pytest
  ```
