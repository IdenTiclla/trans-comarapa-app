#!/bin/bash

# Replace YOUR_TOKEN with a valid JWT token from an admin user
# You can get a token by logging in first

curl -X POST http://localhost:8000/api/v1/drivers \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbjFAY29tYXJhcGEuY29tIiwicm9sZSI6ImFkbWluIiwiaXNfYWRtaW4iOnRydWUsImlzX2FjdGl2ZSI6dHJ1ZSwianRpIjoiMjAxYjVlMTc4YTAyYjJjMzZhNjFhY2JjMWJkODRmNDUiLCJleHAiOjE3NDUyNTQ1MDYsImlhdCI6MTc0NTI1MjcwNn0.O44d4rDPSIwfM9IxuzUI593nGSHiv246x9-zvLwI6Tc" \
-d '{
  "user": {
    "email": "driver100@comarapa.com",
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