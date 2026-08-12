FROM python:3.11-slim

# Evita que o Python escreva arquivos .pyc no container
ENV PYTHONDONTWRITEBYTECODE=1

# Evita o buffer do stdout e stderr do Python para logs imediatos
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Instala dependências do sistema necessárias para compilação caso precisemos
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copia e instala as dependências do Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o restante do código
COPY . .

# Expõe a porta que o FastAPI irá rodar
EXPOSE 8000

# Executa o uvicorn em modo reload para desenvolvimento
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
