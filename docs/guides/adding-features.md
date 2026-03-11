# Adding New Features

## Backend

1. **Model:** `backend/models/[entity].py` (inherit `Base`)
2. **Schema:** `backend/schemas/[entity].py` (`EntityCreate`, `EntityUpdate`, `Entity`)
3. **Repository:** `backend/repositories/[entity]_repository.py`
4. **Service:** `backend/services/[entity]_service.py`
5. **Route:** `backend/routes/[entity].py` (APIRouter)
6. **Migration:** `cd backend && alembic revision --autogenerate -m "Add [entity]" && alembic upgrade head`

## Frontend React

1. **Service:** `frontend-react/src/services/[entity].service.ts`
2. **Store:** `frontend-react/src/store/[entity].slice.ts` (createSlice + createAsyncThunk)
3. **Page:** `frontend-react/src/pages/[section]/[Entity]Page.tsx`
4. **Route:** Add to `frontend-react/src/router/index.tsx`
