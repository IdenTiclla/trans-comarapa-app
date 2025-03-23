import pymysql
from pymysql import OperationalError
from dotenv import load_dotenv
import os

def drop_database():
    # Cargar variables de entorno
    load_dotenv()
    DATABASE_URL = os.getenv("DATABASE_URL")

    # Extraer información de la URL de conexión
    db_info = DATABASE_URL.split("://")[1].split("@")[0]
    user, password = db_info.split(":")
    host = DATABASE_URL.split("@")[1].split("/")[0]
    
    connection = None  # Inicializar la variable connection
    try:
        # Conectar a MySQL
        connection = pymysql.connect(
            host='127.0.0.1',
            user=user,
            password=password
        )

        with connection.cursor() as cursor:
            cursor.execute("DROP DATABASE IF EXISTS trans_comarapa;")
            print("Base de datos 'trans_comarapa' eliminada con éxito.")

    except OperationalError as e:
        print(f"Error al eliminar la base de datos: {e}")
    finally:
        if connection and connection.open:  # Verificar si la conexión está abierta
            connection.close()

if __name__ == "__main__":
    drop_database() 