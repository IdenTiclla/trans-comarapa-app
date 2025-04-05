#!/usr/bin/env python3
"""
Script para ejecutar la aplicación FastAPI.
Este script garantiza que las importaciones funcionen correctamente
independientemente de desde dónde se ejecute.
"""
import os
import sys
import uvicorn

# Asegurarse de que el directorio actual esté en el path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    # Ejecutar la aplicación
    uvicorn.run("main:app", port=8000, reload=True)
