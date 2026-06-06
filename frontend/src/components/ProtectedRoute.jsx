import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * Guards a route. If `role` is provided, the user must have that role,
 * otherwise any authenticated user is allowed.
 */
export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  if (role && user.role !== role) {
    return <Navigate to="/" replace />
  }
  return children
}
