# Etapa base - Node.js
FROM node:20-alpine AS base

WORKDIR /app

ENV NODE_ENV=development

RUN apk add --no-cache git curl

# ------- Desarrollo -------
FROM base AS development

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]

# ------- Build -------
FROM base AS builder

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=production
RUN npm run build

# ------- Producción (nginx) -------
FROM nginx:1.25-alpine AS production

# Copiar config de nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build estático
COPY --from=builder /app/dist /usr/share/nginx/html

# Crear usuario no-root
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup && \
    chown -R appuser:appgroup /usr/share/nginx/html && \
    chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appgroup /var/run/nginx.pid

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
