-- Asegurar que la base de datos existe y está configurada correctamente
CREATE DATABASE IF NOT EXISTS trans_comarapa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE trans_comarapa;

-- Crear usuario para la aplicación (más seguro que usar root)
-- CREATE USER IF NOT EXISTS 'trans_app'@'%' IDENTIFIED BY 'trans_app_password';
-- GRANT ALL PRIVILEGES ON trans_comarapa.* TO 'trans_app'@'%';

-- Configuraciones adicionales
SET GLOBAL time_zone = '+00:00';
SET time_zone = '+00:00';

-- Limpiar privilegios
FLUSH PRIVILEGES; 