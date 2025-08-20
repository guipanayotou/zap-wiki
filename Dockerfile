# ------------------------------------------------------
# 1) Build stage
# ------------------------------------------------------
    FROM node:18-alpine AS builder

    WORKDIR /app
    
    # Copia apenas as definições de dependências
    COPY package.json package-lock.json ./
    
    # Instala ignorando conflitos de peer-deps
    RUN npm install --legacy-peer-deps
    
    # Copia todo o código e gera a build estática
    COPY . .
    RUN npm run build
    
    # ------------------------------------------------------
    # 2) Runtime stage
    # ------------------------------------------------------
    FROM node:18-alpine
    
    WORKDIR /app
    
    # Instala o 'serve' global para servir arquivos estáticos
    RUN npm install -g serve
    
    # Copia somente o resultado da build
    COPY --from=builder /app/dist ./dist
    
    # Usa a variável $PORT (definida pelo EasyPanel) — padrão 3000
    ENV PORT 3000
    
    # Expõe a porta do contêiner
    EXPOSE $PORT
    
    # Comando de inicialização
    CMD ["sh", "-c", "serve -s dist -l $PORT"]
    