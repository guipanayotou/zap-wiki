# =========================
# Stage 1 — Build (Vite)
# =========================
FROM node:18-alpine AS builder
WORKDIR /app

# Melhor cache: primeiro só manifests
COPY package.json package-lock.json* ./

# Instala deps (usa ci se houver lock, com flags para pipelines)
RUN if [ -f package-lock.json ]; then \
      npm ci --legacy-peer-deps --no-audit --no-fund ; \
    else \
      npm install --legacy-peer-deps --no-audit --no-fund ; \
    fi

# Copia o restante do código
COPY . .

# Variáveis em formato recomendado (evita o warning de ENV)
ENV NODE_ENV=production

# Build do app (gera /app/dist)
RUN npm run build


# =========================
# Stage 2 — Runtime (NGINX)
# =========================
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Ambientes explícitos
ENV NODE_ENV=production
ENV PORT=80

# Copia artefatos estáticos
COPY --from=builder /app/dist/ ./

# Cria a configuração do NGINX (SPA-friendly; funciona com hash ou history)
# try_files garante fallback para index.html em rotas client-side.
RUN set -eux; \
  printf '%s\n' \
  'server {' \
  '  listen       80;' \
  '  server_name  _;' \
  '  sendfile     on;' \
  '  default_type application/octet-stream;' \
  '' \
  '  gzip on;' \
  '  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;' \
  '' \
  '  root   /usr/share/nginx/html;' \
  '  index  index.html;' \
  '' \
  '  location / {' \
  '    try_files $uri $uri/ /index.html;' \
  '  }' \
  '' \
  '  location ~* \.(?:ico|css|js|gif|jpe?g|png|svg|woff2?)$ {' \
  '    expires 30d;' \
  '    access_log off;' \
  '  }' \
  '}' \
  > /etc/nginx/conf.d/default.conf

# (Opcional) Healthcheck simples na raiz
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
