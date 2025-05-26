"""
Configuración para el seeding de datos según el entorno
"""
import os
from dataclasses import dataclass
from typing import Dict, Any

@dataclass
class SeedConfig:
    """Configuración para el seeding de datos"""
    
    # Cantidad de datos a generar
    num_clients: int
    num_drivers: int
    num_secretaries: int
    num_assistants: int
    num_trips: int
    num_buses: int
    
    # Configuración de datos
    clear_existing: bool
    create_test_users: bool
    use_realistic_data: bool
    
    # Configuración específica
    bolivian_data: bool = True
    future_trips_days: int = 30
    past_trips_days: int = 30

# Configuraciones por entorno
ENVIRONMENTS: Dict[str, SeedConfig] = {
    "minimal": SeedConfig(
        num_clients=5,
        num_drivers=2,
        num_secretaries=2,
        num_assistants=2,
        num_trips=10,
        num_buses=2,
        clear_existing=True,
        create_test_users=True,
        use_realistic_data=False,
    ),
    
    "development": SeedConfig(
        num_clients=40,
        num_drivers=10,
        num_secretaries=7,
        num_assistants=10,
        num_trips=60,
        num_buses=5,
        clear_existing=True,
        create_test_users=True,
        use_realistic_data=True,
    ),
    
    "testing": SeedConfig(
        num_clients=10,
        num_drivers=3,
        num_secretaries=3,
        num_assistants=3,
        num_trips=20,
        num_buses=3,
        clear_existing=True,
        create_test_users=True,
        use_realistic_data=False,
    ),
    
    "demo": SeedConfig(
        num_clients=100,
        num_drivers=15,
        num_secretaries=10,
        num_assistants=15,
        num_trips=200,
        num_buses=8,
        clear_existing=True,
        create_test_users=True,
        use_realistic_data=True,
    )
}

def get_config(environment: str = None) -> SeedConfig:
    """
    Obtiene la configuración para el entorno especificado
    
    Args:
        environment: Nombre del entorno (minimal, development, testing, demo)
                    Si no se especifica, usa la variable SEED_ENV o 'development'
    
    Returns:
        SeedConfig: Configuración para el entorno
    """
    if environment is None:
        environment = os.getenv("SEED_ENV", "development")
    
    if environment not in ENVIRONMENTS:
        available = ", ".join(ENVIRONMENTS.keys())
        raise ValueError(f"Entorno '{environment}' no válido. Disponibles: {available}")
    
    return ENVIRONMENTS[environment] 