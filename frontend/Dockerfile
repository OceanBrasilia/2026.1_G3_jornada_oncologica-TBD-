FROM node:20-slim

WORKDIR /app

# Copia apenas o arquivo de dependências do frontend
COPY package.json ./

# Instala as dependências usando o npm (mais estável para ambientes dockerizados com Vite)
RUN npm install

# Copia o restante dos arquivos do frontend
COPY . .

# Expõe a porta padrão do Vite
EXPOSE 5173

# Inicia o servidor de desenvolvimento exposto para a rede do container
CMD ["npm", "run", "dev"]
