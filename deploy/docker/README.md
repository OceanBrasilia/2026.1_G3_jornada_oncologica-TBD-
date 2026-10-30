# Docker local

A aplicação possui `Dockerfile` em `software/backend/Dockerfile` e `software/frontend/Dockerfile`, orquestrados pelo arquivo `compose.yaml` na raiz do repositório.

## Como executar

1. (Opcional) Caso precise customizar variáveis de banco de dados (ex.: conexão com banco de homologação na rede HUB), copie `software/env.example` para `.env` na raiz:
   ```bash
   cp software/env.example .env
   ```
   > Atenção: Nunca versione arquivos `.env` ou credenciais reais.

2. Na raiz do repositório, suba os containers:
   ```bash
   docker compose up --build
   ```

3. Acesse no navegador:
   - **Frontend:** http://localhost:5173
   - **Backend (API):** http://localhost:8001
   - **Swagger (Docs):** http://localhost:8001/docs

4. Para encerrar:
   ```bash
   docker compose down
   ```
