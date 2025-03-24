#!/usr/bin/env python3
"""
Script para corregir las importaciones en todos los archivos Python del proyecto.
Reemplaza 'from X' por 'from X' y 'from X' por 'from X'.
"""

import os
import re
import sys
from pathlib import Path

def fix_imports_in_file(file_path):
    """Corrige las importaciones en un archivo específico."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Reemplazar importaciones con prefijo 'backend.'
        modified_content = re.sub(r'from\s+backend\.', 'from ', content)
        
        # Reemplazar importaciones relativas
        modified_content = re.sub(r'from\s+\.\.?', 'from ', modified_content)
        
        # Solo guardar si se hicieron cambios
        if content != modified_content:
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(modified_content)
            return True
        return False
    except Exception as e:
        print(f"Error procesando {file_path}: {e}")
        return False

def main():
    """Función principal que recorre todos los archivos Python y corrige importaciones."""
    # Obtener el directorio raíz del proyecto (donde se ejecuta el script)
    root_dir = Path(os.getcwd())
    
    files_modified = 0
    python_files = list(root_dir.glob('**/*.py'))
    
    print(f"Procesando {len(python_files)} archivos Python...")
    
    for py_file in python_files:
        # Saltar archivos en el entorno virtual si existe
        if '.venv' in str(py_file) or 'venv' in str(py_file):
            continue
        
        # Arreglar importaciones
        if fix_imports_in_file(py_file):
            files_modified += 1
            print(f"Corregidas importaciones en: {py_file}")
    
    print(f"\nProceso completado. {files_modified} archivos modificados.")
    return 0

if __name__ == "__main__":
    sys.exit(main()) 