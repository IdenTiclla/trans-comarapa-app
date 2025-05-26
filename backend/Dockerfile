# Etapa de base - Utilizamos una imagen oficial de Python con Alpine para tener un tamaño reducido
FROM python:3.12-slim as base

# Establecer directorio de trabajo
WORKDIR /app

# Configuración de Python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PYTHONPATH=/app

# Instalar dependencias del sistema necesarias
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        pkg-config \
        default-libmysqlclient-dev \
        libffi-dev \
        libssl-dev \
        netcat-traditional \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Instalar uv para una instalación más rápida de paquetes
RUN curl -LsSf https://astral.sh/uv/install.sh | sh \
    && . $HOME/.local/bin/env

# Agregar uv al PATH
ENV PATH="/root/.local/bin:$PATH"

# Etapa de desarrollo - Incluye herramientas adicionales para desarrollo
FROM base as development

# Copiar archivos de dependencias
COPY pyproject.toml uv.lock* ./

# Instalar dependencias usando pyproject.toml
RUN uv pip install --system -e .

# Copiar script de espera
COPY scripts/wait-for-db.sh /wait-for-db.sh
RUN chmod +x /wait-for-db.sh

# Copiar el código de la aplicación
COPY . .

# Exponer puerto
EXPOSE 8000

# Crear script de entrada
RUN echo '#!/bin/bash\n\
/wait-for-db.sh db 3306\n\
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload\n\
' > /entrypoint.sh && chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

# Etapa de producción - Imagen final optimizada
FROM base as production

# Copiar archivos de dependencias
COPY pyproject.toml uv.lock* ./

# Instalar dependencias de producción
RUN uv pip install --system .

# Copiar script de espera
COPY scripts/wait-for-db.sh /wait-for-db.sh
RUN chmod +x /wait-for-db.sh

# Copiar el código de la aplicación
COPY . .

# Exponer puerto
EXPOSE 8000

# Crear script de entrada para producción (sin reload)
RUN echo '#!/bin/bash\n\
/wait-for-db.sh db 3306\n\
exec uvicorn main:app --host 0.0.0.0 --port 8000\n\
' > /entrypoint.sh && chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"] 