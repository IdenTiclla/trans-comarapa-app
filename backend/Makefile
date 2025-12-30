# Trans Comarapa Backend Makefile
.PHONY: help test test-unit test-integration test-regression test-auth setup-dev run dev clean install

# Default target
help:
	@echo "Trans Comarapa Backend - Available Commands:"
	@echo "  make setup-dev     - Set up development environment"
	@echo "  make install       - Install dependencies"
	@echo "  make run          - Run the development server"
	@echo "  make dev          - Run with auto-reload"
	@echo "  make test         - Run all tests"
	@echo "  make test-unit    - Run unit tests only"
	@echo "  make test-integration - Run integration tests only"
	@echo "  make test-regression - Run regression tests only"
	@echo "  make test-auth    - Run comprehensive auth tests"
	@echo "  make clean        - Clean cache and temp files"

# Development setup
setup-dev:
	uv sync
	@echo "Development environment ready!"

install:
	uv sync

# Run application
run:
	uv run python run.py

dev:
	uv run python run.py --reload

# Testing commands
test:
	@echo "Running all tests..."
	SECRET_KEY="test-secret-key" uv run pytest tests/ -v

test-unit:
	@echo "Running unit tests..."
	SECRET_KEY="test-secret-key" uv run pytest tests/unit/ -v -m unit

test-integration:
	@echo "Running integration tests..."
	SECRET_KEY="test-secret-key" uv run pytest tests/integration/ -v -m integration

test-regression:
	@echo "Running regression tests..."
	uv run python run_regression_tests.py

test-auth:
	@echo "Running comprehensive authentication tests..."
	uv run python run_regression_tests.py --auth-only

test-backend:
	@echo "Running backend test suite..."
	SECRET_KEY="test-secret-key" uv run pytest tests/ -v --tb=short

# Maintenance
clean:
	find . -type d -name "__pycache__" -delete
	find . -type f -name "*.pyc" -delete
	find . -type d -name ".pytest_cache" -delete
	@echo "Cache cleaned!"

# Database operations
db-seed:
	uv run python db/seed.py

db-migrate:
	uv run alembic upgrade head

db-reset:
	rm -f trans_comarapa.db
	uv run alembic upgrade head
	uv run python db/seed.py

# Code quality
lint:
	uv run ruff check .

format:
	uv run ruff format .

# CI/CD support
ci-test:
	@echo "Running CI test suite..."
	SECRET_KEY="test-secret-key" uv run pytest tests/ -v --tb=short --durations=10

ci-regression:
	@echo "Running CI regression tests..."
	uv run python run_regression_tests.py