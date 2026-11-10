# ──────────────────────────────────────────────────────────────────────────────
# Dockerfile — Frontend React + Vite
# Build multi-stage: Node para compilar, Nginx para servir
# ──────────────────────────────────────────────────────────────────────────────

# ── Etapa 1: Compilar la aplicación React ────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package.json package-lock.json* ./
RUN npm ci

# Copiar código y compilar
COPY . .

# En producción la URL base de la API la recibe como variable de entorno
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ── Etapa 2: Servir con Nginx ────────────────────────────────────────────────
FROM nginx:alpine AS production

# Copiar los archivos compilados
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración de Nginx para SPA (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
