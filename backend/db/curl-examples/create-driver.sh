#!/bin/bash

# Replace YOUR_ADMIN_JWT_TOKEN_HERE with a valid JWT token from an admin user
# You can get a token by logging in first

curl -X POST http://localhost:8000/api/v1/drivers \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE" \
-d '{
  "user": {
    "email": "driver100@transcomarapa.com",
    "password": "123456",
    "username": "driver100",
    "role": "driver",
    "is_active": true,
    "is_admin": false
  },
  "firstname": "Luis",
  "lastname": "Mamani",
  "phone": "70000003",
  "license_number": "ABC123",
  "experience_years": 5
}'

# Note: 
# 1. This uses the UserCreate schema which requires all fields
# 2. Although we pass experience_years, it will be ignored by the backend
# 3. The backend will set default values for license_type, license_expiry and status 