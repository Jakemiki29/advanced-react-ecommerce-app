import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../store/hooks/useAuth'

function ProtectedRoute({ admin = false }) {
  const { isAuthenticated, user } = useAuth()

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check if admin route but user is not admin
  if (admin && user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
