import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '@/services/auth.service'
import { profileService } from '@/services/profile.service'
import type { AuthUser } from '@/types/auth'

interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
}

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await authService.login(email, password)
      const user: AuthUser = {
        id: data.user_id,
        role: data.role,
        email,
        username: data.username || email,
        firstname: data.firstname || '',
        lastname: data.lastname || '',
        person: data.person || null,
        profile: data.profile || null,
        office_id: data.office_id,
      }
      return user
    } catch (error) {
      const message = (error as Error).message || 'Error en el inicio de sesión'
      return rejectWithValue(message === 'Incorrect email or password' ? 'Email o contraseña incorrectos' : message)
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (skipServerLogout: boolean = false) => {
    await authService.logout(skipServerLogout)
  }
)

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const data = await authService.refreshToken()
      const state = getState() as { auth: AuthState }
      const currentUser = state.auth.user
      if (data.user_id && currentUser) {
        return {
          ...currentUser,
          firstname: data.firstname || currentUser.firstname,
          lastname: data.lastname || currentUser.lastname,
          person: data.person || currentUser.person,
        }
      }
      return currentUser
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const loadProfile = createAsyncThunk(
  'auth/loadProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const profile = await profileService.getProfile()
      const state = getState() as { auth: AuthState }
      const currentUser = state.auth.user
      const user: AuthUser = {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        role: profile.role,
        is_active: profile.is_active,
        is_admin: profile.is_admin,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        firstname: profile.firstname,
        lastname: profile.lastname,
        phone: profile.phone,
        birth_date: profile.birth_date,
        person: profile.person,
        // Preserve office_id from existing state — the /me profile endpoint
        // does not return it, but it was set during login for secretaries.
        office_id: currentUser?.office_id,
      }
      localStorage.setItem('user_data', JSON.stringify(user))
      return user
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Error al cargar el perfil')
    }
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: Parameters<typeof profileService.updateProfile>[0], { getState, rejectWithValue }) => {
    try {
      const updated = await profileService.updateProfile(profileData)
      const state = getState() as { auth: AuthState }
      const currentUser = state.auth.user
      const user: AuthUser = {
        ...currentUser!,
        email: updated.email,
        firstname: updated.firstname,
        lastname: updated.lastname,
        phone: updated.phone,
        birth_date: updated.birth_date,
        person: updated.person,
        updated_at: updated.updated_at,
      }
      localStorage.setItem('user_data', JSON.stringify(user))
      return user
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Error al actualizar el perfil')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    initAuth(state) {
      const userData = authService.getUserData()
      state.user = userData || null
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.error = null
      })
      // Refresh token
      .addCase(refreshToken.fulfilled, (state, action) => {
        if (action.payload) state.user = action.payload
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null
      })
      // Load profile
      .addCase(loadProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loadProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(loadProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { initAuth, clearError } = authSlice.actions

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectIsAuthenticated = (state: { auth: AuthState }) => !!state.auth.user
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role ?? null
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error

export default authSlice.reducer
