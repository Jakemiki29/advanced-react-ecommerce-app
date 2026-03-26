import { useSelector, useDispatch } from 'react-redux'
import { login, logout, register, clearError } from '../slices/authSlice'

/**
 * Custom hook to access authentication state and actions
 * @returns {Object} Auth state and dispatch functions
 */
export function useAuth() {
  const dispatch = useDispatch()
  const { user, isLoading, error, isInitialized } = useSelector((state) => state.auth)

  return {
    user,
    isLoading,
    error,
    isInitialized,
    isAuthenticated: !!user,
    register: (email, password, displayName) =>
      dispatch(register({ email, password, displayName })),
    login: (email, password) => dispatch(login({ email, password })),
    logout: () => dispatch(logout()),
    clearError: () => dispatch(clearError()),
  }
}
