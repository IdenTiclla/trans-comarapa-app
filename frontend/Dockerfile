# Etapa de base - Node.js
FROM node:20-alpine as base

# Establecer directorio de trabajo
WORKDIR /app

# Configuración de Node.js
ENV NODE_ENV=development
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# Instalar dependencias del sistema
RUN apk add --no-cache \
    git \
    curl

# Etapa de desarrollo
FROM base as development

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código de la aplicación
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando para desarrollo con hot reload
CMD ["npm", "run", "dev"]

# Etapa de construcción
FROM base as builder

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código de la aplicación
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:20-alpine as production

WORKDIR /app

# Configuración para producción
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# Instalar solo dependencias de producción
COPY package*.json ./
RUN npm install --only=production && npm cache clean --force

# Copiar archivos construidos desde la etapa builder
COPY --from=builder /app/.output ./.output

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nuxtjs -u 1001

# Cambiar propietario de archivos
RUN chown -R nuxtjs:nodejs /app
USER nuxtjs

# Exponer puerto
EXPOSE 3000

# Comando para producción
CMD ["node", ".output/server/index.mjs"] 