import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function NavBar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          📚 Digital Library
        </Link>
        <div className="d-flex align-items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link className="nav-link text-white" to={isAdmin ? '/admin' : '/reader'}>
                {isAdmin ? 'Admin Dashboard' : 'My Library'}
              </Link>
              <span className="text-white-50 small">
                {user.username} ({user.role})
              </span>
              <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="nav-link text-white" to="/login">
                Login
              </Link>
              <Link className="nav-link text-white" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
