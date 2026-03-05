import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    login as loginThunk,
    logout as logoutThunk,
    loadProfile as loadProfileThunk,
    updateProfile as updateProfileThunk,
    selectUser,
    selectIsAuthenticated,
    selectUserRole,
    selectAuthLoading,
    selectAuthError,
    clearError,
} from '@/store/auth.slice'
import { DASHBOARD_PATHS, type Role } from '@/lib/constants'

export function useAuth() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const user = useAppSelector(selectUser)
    const isAuthenticated = useAppSelector(selectIsAuthenticated)
    const userRole = useAppSelector(selectUserRole)
    const loading = useAppSelector(selectAuthLoading)
    const error = useAppSelector(selectAuthError)

    const userFullName = useMemo(() => {
        if (!user) return ''
        if (user.firstname && user.lastname) return `${user.firstname} ${user.lastname}`
        if (user.firstname) return user.firstname
        return user.email
    }, [user])

    const userInitials = useMemo(() => {
        if (!user) return 'U'
        if (user.firstname && user.lastname) {
            return `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase()
        }
        if (userFullName) return userFullName.substring(0, 2).toUpperCase()
        return 'U'
    }, [user, userFullName])

    const dashboardPath = useMemo(() => {
        if (!userRole) return '/login'
        return DASHBOARD_PATHS[userRole as Role] ?? '/dashboards/dashboard-secretary'
    }, [userRole])

    const login = useCallback(
        async (email: string, password: string) => {
            const result = await dispatch(loginThunk({ email, password }))
            if (loginThunk.fulfilled.match(result)) {
                const role = result.payload.role as Role
                navigate(DASHBOARD_PATHS[role] ?? '/dashboards/dashboard-secretary')
            }
            return result
        },
        [dispatch, navigate]
    )

    const logout = useCallback(async () => {
        await dispatch(logoutThunk(false))
        navigate('/login')
    }, [dispatch, navigate])

    const loadProfile = useCallback(() => dispatch(loadProfileThunk()), [dispatch])

    const updateProfileFn = useCallback(
        (data: Parameters<typeof updateProfileThunk>[0]) => dispatch(updateProfileThunk(data)),
        [dispatch]
    )

    const clearAuthError = useCallback(() => dispatch(clearError()), [dispatch])

    return {
        user,
        isAuthenticated,
        userRole,
        loading,
        error,
        userFullName,
        userInitials,
        dashboardPath,
        login,
        logout,
        loadProfile,
        updateProfile: updateProfileFn,
        clearError: clearAuthError,
    }
}
