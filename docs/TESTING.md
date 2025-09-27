# Testing Guide - Trans Comarapa

## Overview

This document describes the comprehensive testing strategy for Trans Comarapa, including regression tests for authentication (login/logout) functionality.

## Test Structure

### Test Types

1. **Unit Tests** (`tests/unit/`): Test individual components in isolation
2. **Integration Tests** (`tests/integration/`): Test interaction between components
3. **Regression Tests** (`tests/regression/`): Ensure existing functionality doesn't break

### Authentication Tests

#### Comprehensive Auth Tests (`tests/unit/test_auth_comprehensive.py`)

- **Login Tests**:
  - Successful login with complete response validation
  - Invalid credentials handling
  - Rate limiting and brute force protection
  - Cookie security validation
  - Token structure verification

- **Logout Tests**:
  - Successful logout
  - Token invalidation
  - Cookie clearing
  - Double logout prevention
  - Token blacklisting

- **Security Tests**:
  - SQL injection protection
  - Token claim validation
  - JTI uniqueness
  - Unauthorized access prevention

#### Regression Tests (`tests/regression/test_auth_regression.py`)

Critical tests to prevent breaking changes:

- Complete login/logout flow
- Token structure consistency
- Security validations
- API response format stability

## Running Tests

### Quick Commands

```bash
# All tests
make test

# Unit tests only
make test-unit

# Integration tests only
make test-integration

# Regression tests only
make test-regression

# Comprehensive auth tests
make test-auth
```

### Manual Commands

```bash
# Backend setup
cd backend
uv sync
source .venv/bin/activate

# Run all tests
DATABASE_URL="sqlite:///:memory:" SECRET_KEY="test-secret-key" pytest tests/ -v

# Run regression tests
DATABASE_URL="sqlite:///:memory:" SECRET_KEY="test-secret-key" python run_regression_tests.py

# Run comprehensive auth tests
DATABASE_URL="sqlite:///:memory:" SECRET_KEY="test-secret-key" python run_regression_tests.py --auth-only

# Run tests with specific markers
pytest -m "regression" -v
pytest -m "auth" -v
pytest -m "security" -v
```

## Test Configuration

### Environment Variables

Required for testing:

```bash
DATABASE_URL="sqlite:///:memory:"    # In-memory database for tests
SECRET_KEY="test-secret-key"        # Test JWT secret
TESTING=true                        # Testing mode flag
```

### Configuration Files

- `pytest.ini`: Main pytest configuration
- `pytest-regression.ini`: Regression-specific configuration
- `conftest.py`: Shared test fixtures and setup

## Test Markers

- `@pytest.mark.unit`: Unit tests
- `@pytest.mark.integration`: Integration tests
- `@pytest.mark.regression`: Regression tests
- `@pytest.mark.auth`: Authentication tests
- `@pytest.mark.security`: Security-related tests
- `@pytest.mark.breaking_change`: Tests preventing breaking changes
- `@pytest.mark.critical_path`: Critical user flow tests

## CI/CD Integration

### GitHub Actions

The CI/CD pipeline includes:

1. **Backend Tests**: All unit and integration tests
2. **Regression Tests**: Critical functionality validation
3. **Comprehensive Auth Tests**: Detailed authentication testing

### Test Stages

```
backend-tests → regression-tests → build-and-security-check → deployment
```

## Adding New Tests

### For New Features

1. Add unit tests in `tests/unit/test_[feature].py`
2. Add integration tests if needed in `tests/integration/`
3. Update fixtures in `conftest.py` if needed

### For Critical Features

1. Add regression tests in `tests/regression/test_[feature]_regression.py`
2. Mark with `@pytest.mark.regression`
3. Include in `run_regression_tests.py` if needed

### For Authentication

1. Add to `test_auth_comprehensive.py` for detailed testing
2. Add to `test_auth_regression.py` for critical path validation
3. Use appropriate test markers

## Test Data and Fixtures

### Standard Fixtures

- `test_user`: Standard user for testing
- `test_admin`: Admin user for testing
- `user_token`: Valid JWT token for testing
- `admin_token`: Admin JWT token for testing
- `client`: FastAPI test client
- `db_session`: Database session for testing

### Database

Tests use SQLite in-memory database for speed and isolation. Each test gets a fresh database instance.

## Debugging Tests

### Failed Tests

```bash
# Run with detailed output
pytest -v --tb=long

# Run specific test
pytest tests/unit/test_auth_comprehensive.py::TestAuthenticationLogin::test_login_success -v

# Run with debugging
pytest --pdb tests/unit/test_auth_comprehensive.py
```

### Test Coverage

```bash
# Run with coverage
pytest --cov=. --cov-report=html

# Open coverage report
open htmlcov/index.html
```

## Best Practices

### Writing Tests

1. **Descriptive Names**: Test names should clearly describe what they test
2. **Arrange-Act-Assert**: Structure tests clearly
3. **Isolation**: Each test should be independent
4. **Markers**: Use appropriate pytest markers
5. **Fixtures**: Reuse common setup via fixtures

### Regression Tests

1. **Critical Paths**: Focus on user-facing functionality
2. **API Contracts**: Ensure response structures don't change
3. **Security**: Always test security-related functionality
4. **Breaking Changes**: Add tests when fixing bugs

### Performance

1. **Fast Execution**: Use in-memory database for speed
2. **Parallel Execution**: Tests should support parallel runs
3. **Minimal Dependencies**: Avoid external service dependencies

## Troubleshooting

### Common Issues

1. **Database Conflicts**: Ensure unique test data
2. **Token Expiration**: Use fresh tokens for each test
3. **Async Issues**: Proper handling of async operations
4. **Import Errors**: Check Python path and dependencies

### Environment Issues

```bash
# Reset test environment
make clean
cd backend && uv sync

# Check dependencies
cd backend && uv run pip list

# Test database connection
cd backend && python -c "from db.session import get_db; print('DB OK')"
```

## Monitoring and Metrics

- Test execution time tracked in CI/CD
- Coverage reports generated
- Failure notifications in CI/CD
- Regression test results logged

This testing framework ensures that authentication functionality remains stable and secure as the application evolves.