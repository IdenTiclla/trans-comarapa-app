---
description: Create and apply a new database migration
---

# Create and Apply a Database Migration

Use this workflow when you have made changes to the SQLAlchemy models in the `backend/models/` directory and need to update the database schema. The backend uses Alembic for database migrations.

## Workflow Steps

// turbo
1. Navigate to the backend directory and generate a new Alembic migration script. Replace `<migration_name>` with a descriptive name for your changes (e.g., "add_user_status" or "create_package_table").
```bash
cd /home/iden/Desktop/trans-comarapa-app/backend
alembic revision --autogenerate -m "<migration_name>"
```

2. Alembic will generate a new file in `backend/alembic/versions/`. Read the file and carefully verify that the `upgrade()` and `downgrade()` functions correctly reflect your intended model changes.

// turbo
3. Apply the migration to update the database schema.
```bash
cd /home/iden/Desktop/trans-comarapa-app/backend
alembic upgrade head
```

4. Verify that the changes were applied correctly by checking the database tables (e.g. using `sqlite3` or your preferred tool) and by running the application tests.
