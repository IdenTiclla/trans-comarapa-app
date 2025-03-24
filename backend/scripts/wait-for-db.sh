#!/bin/bash
# wait-for-db.sh - Script para esperar a que la base de datos esté disponible

set -e

if [ "$#" -lt 2 ]; then
    echo "Uso: $0 host puerto [timeout]"
    exit 1
fi

HOST="$1"
PORT="$2"
TIMEOUT="${3:-60}"  # Timeout por defecto: 60 segundos

echo "Esperando a que la base de datos ($HOST:$PORT) esté disponible..."

# Contador para el timeout
COUNTER=0

while ! nc -z -v -w1 "$HOST" "$PORT" > /dev/null 2>&1; do
    if [ "$COUNTER" -ge "$TIMEOUT" ]; then
        echo "Error: Timeout alcanzado esperando a la base de datos"
        exit 1
    fi
    
    echo "Base de datos no disponible aún. Reintentando... ($COUNTER/$TIMEOUT)"
    COUNTER=$((COUNTER+1))
    sleep 1
done

echo "Base de datos disponible en $HOST:$PORT" 