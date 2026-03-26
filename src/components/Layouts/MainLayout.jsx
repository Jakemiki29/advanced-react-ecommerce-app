import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/hooks/useAuth'
import './MainLayout.css'

function MainLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="main-layout">
      <header className="main-header">
        <div className="header-left">
          <h1 className="app-title">E-Commerce Store</h1>
        </div>
        <nav className="header-nav">
          <ul className="nav-links">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/dashboard">Profile</a>
            </li>
            <li>
              <a href="/orders">Orders</a>
            </li>
          </ul>
        </nav>
        <div className="header-right">
          <span className="user-info">
            Welcome, <strong>{user?.displayName || 'User'}</strong>
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="app-shell">
          {children}
        </div>
      </main>

      <footer className="main-footer">
        <p>&copy; 2024 E-Commerce Store. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default MainLayout
