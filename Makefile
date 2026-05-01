# Makefile para Trans Comarapa
.PHONY: help build up down logs clean restart shell-backend shell-frontend shell-db seed seed-test-users clear-db setup test test-watch test-coverage

# Variables
DOCKER_COMPOSE = docker compose
COMPOSE_FILE = docker-compose.yml
COMPOSE_PROD_FILE = docker-compose.prod.yml

# Ayuda
help:
	@echo "Comandos disponibles:"
	@echo "  make up          - Iniciar todos los servicios en modo desarrollo"
	@echo "  make up-prod     - Iniciar todos los servicios en modo producción"
	@echo "  make down        - Detener todos los servicios"
	@echo "  make build       - Construir todas las imágenes"
	@echo "  make rebuild     - Reconstruir todas las imágenes sin cache"
	@echo "  make logs        - Ver logs de todos los servicios"
	@echo "  make logs-f      - Ver logs en tiempo real"
	@echo "  make restart     - Reiniciar todos los servicios"
	@echo "  make clean       - Limpiar contenedores, imágenes y volúmenes"
	@echo "  make shell-backend   - Acceder al shell del backend"
	@echo "  make shell-frontend  - Acceder al shell del frontend"
	@echo "  make shell-db        - Acceder al shell de la base de datos"
	@echo "  make setup       - Configuración inicial del proyecto"
	@echo "  make seed        - Sembrar la base de datos con datos de desarrollo"
	@echo "  make seed-minimal - Sembrar con datos mínimos (rápido para testing)"
	@echo "  make seed-testing - Sembrar con datos de testing"
	@echo "  make seed-demo   - Sembrar con muchos datos (para demos)"
	@echo "  make seed-test-users - Crear usuarios de prueba solo (más rápido para desarrollo)"
	@echo "  make clear-db    - Limpiar todos los datos de la base de datos (PELIGROSO!)"
	@echo "  make test        - Ejecutar todas las pruebas unitarias y de componentes"
	@echo "  make test-watch  - Ejecutar pruebas en modo observador (watch mode)"
	@echo "  make test-coverage - Generar reporte de cobertura de pruebas"

# Comandos principales
up:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) up -d

up-prod:
	$(DOCKER_COMPOSE) -f $(COMPOSE_PROD_FILE) up -d

down:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) down

down-prod:
	$(DOCKER_COMPOSE) -f $(COMPOSE_PROD_FILE) down

build:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) build

build-prod:
	$(DOCKER_COMPOSE) -f $(COMPOSE_PROD_FILE) build

rebuild:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) build --no-cache

rebuild-prod:
	$(DOCKER_COMPOSE) -f $(COMPOSE_PROD_FILE) build --no-cache

# Logs
logs:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) logs

logs-f:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) logs -f

logs-backend:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) logs backend

logs-frontend:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) logs frontend

logs-db:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) logs db

# Reiniciar servicios
restart:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) restart

restart-backend:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) restart backend

restart-frontend:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) restart frontend

restart-db:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) restart db

# Acceso a shells
shell-backend:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) exec backend bash

shell-frontend:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) exec frontend sh

shell-db:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) exec db mysql -u root -p trans_comarapa

# Limpieza
clean:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) down -v
	docker system prune -f
	docker volume prune -f

clean-all:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) down -v --rmi all
	docker system prune -af
	docker volume prune -f

# Configuración inicial
setup: ## Configuración inicial del proyecto
	@echo "🚀 Configurando Trans Comarapa..."
	@if [ ! -f .env ]; then \
		echo "📝 Copiando archivo de configuración..."; \
		cp env.example .env; \
		echo "✅ Archivo .env creado. Revisa y ajusta las variables si es necesario."; \
	fi
	@echo "🏗️  Construyendo contenedores..."
	$(MAKE) build
	@echo "🚀 Iniciando servicios..."
	$(MAKE) up
	@echo "⏳ Esperando que los servicios estén listos..."
	@sleep 20
	@echo "🌱 Poblando base de datos con datos de prueba..."
	$(MAKE) seed
	@echo ""
	@echo "🎉 ¡Configuración completada!"
	@echo ""
	@echo "📋 Servicios disponibles:"
	@echo "  🌐 Frontend: http://localhost:3000"
	@echo "  🔧 Backend API: http://localhost:8000"
	@echo "  📊 Base de datos: localhost:3308"
	@echo ""
	@echo "👥 Usuarios de prueba creados:"
	@echo "  📧 Admin: admin1@transcomarapa.com (contraseña: 123456)"
	@echo "  📧 Secretario: secretary1@transcomarapa.com (contraseña: 123456)"
	@echo "  📧 Cliente: client1@transcomarapa.com (contraseña: 123456)"
	@echo ""
	@echo "🔍 Para ver todos los usuarios de prueba: make seed-test-users"

# Estado de los servicios
status:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) ps

# Actualizar dependencias
update-deps:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) exec backend pip install --upgrade -r requirements.txt
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) exec frontend npm update

# Database operations
seed: ## Seed the database with sample data (development environment)
	@echo "🌱 Seeding database with development data..."
	$(DOCKER_COMPOSE) exec backend python db/seed.py

seed-minimal: ## Seed with minimal data (fast for testing)
	@echo "🌱 Seeding database with minimal data..."
	$(DOCKER_COMPOSE) exec backend python -c "import os; os.environ['SEED_ENV']='minimal'; exec(open('db/seed.py').read())"

seed-testing: ## Seed with testing data
	@echo "🌱 Seeding database with testing data..."
	$(DOCKER_COMPOSE) exec backend python -c "import os; os.environ['SEED_ENV']='testing'; exec(open('db/seed.py').read())"

seed-demo: ## Seed with demo data (lots of data for presentations)
	@echo "🌱 Seeding database with demo data..."
	$(DOCKER_COMPOSE) exec backend python -c "import os; os.environ['SEED_ENV']='demo'; exec(open('db/seed.py').read())"

seed-test-users: ## Create test users only (faster for development)
	@echo "👥 Creating test users..."
	$(DOCKER_COMPOSE) exec backend python -c "from db.seed import create_test_users; create_test_users()"

clear-db: ## Clear all data from database (DANGEROUS!)
	@echo "⚠️  WARNING: This will delete ALL data from the database!"
	@read -p "Are you sure? Type 'yes' to continue: " confirm && [ "$$confirm" = "yes" ] || exit 1
	$(DOCKER_COMPOSE) exec backend python -c "from db.seed import clear_db; clear_db()"

# Pruebas
test: ## Ejecutar todas las pruebas
	@echo "🧪  Ejecutando pruebas..."
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) exec frontend npm run test -- --run

test-watch: ## Ejecutar pruebas en modo observador
	@echo "👀  Ejecutando pruebas en modo observador..."
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) exec frontend npm run test

test-coverage: ## Generar reporte de cobertura de pruebas
	@echo "📊  Generando reporte de cobertura..."
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) exec frontend npm run test -- --coverage

# ── Linting ──────────────────────────────────────────────
lint-install: ## Instalar hooks de pre-commit
	pip install --break-system-packages pre-commit && pre-commit install

lint: ## Ejecutar linter en todos los archivos
	pre-commit run --all-files

# ── Database Migrations ──────────────────────────────────────────────
db-migrate: ## Generar nueva migración Alembic (autogenerate)
	@echo "🔄  Generando migración..."
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) exec backend alembic revision --autogenerate -m "$(msg)"

db-upgrade: ## Aplicar migraciones pendientes
	@echo "⬆️  Aplicando migraciones..."
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) exec backend alembic upgrade head

db-downgrade: ## Revertir última migración
	@echo "⬇️  Revirtiendo migración..."
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) exec backend alembic downgrade -1

db-history: ## Ver historial de migraciones
	@echo "📜  Historial de migraciones:"
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) exec backend alembic history --verbose 