import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { initializeAuth } from '../../store/slices/authSlice'

function AuthGuard({ children }) {
  const dispatch = useDispatch()
  const { isInitialized } = useSelector((state) => state.auth)

  useEffect(() => {
    // Initialize auth state on app load
    dispatch(initializeAuth())
  }, [dispatch])

  // Show loading state while checking auth
  if (!isInitialized) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    )
  }

  return children
}

export default AuthGuard
