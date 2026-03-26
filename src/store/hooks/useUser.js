import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchUserProfile, updateProfile, deleteAccount, clearError } from '../slices/userSlice'

/**
 * Custom hook to access user profile state and actions
 * @returns {Object} User profile state and dispatch functions
 */
export function useUser() {
  const dispatch = useDispatch()
  const { profile, isLoading, error, lastUpdated } = useSelector((state) => state.user)

  const fetchProfile = useCallback((userId) => dispatch(fetchUserProfile(userId)), [dispatch])
  const updateProfileData = useCallback((userId, updates) => dispatch(updateProfile({ userId, updates })), [dispatch])
  const deleteUserAccount = useCallback((userId) => dispatch(deleteAccount(userId)), [dispatch])
  const clearUserError = useCallback(() => dispatch(clearError()), [dispatch])

  return {
    profile,
    isLoading,
    error,
    lastUpdated,
    fetchProfile,
    updateProfile: updateProfileData,
    deleteAccount: deleteUserAccount,
    clearError: clearUserError,
  }
}
