import { useState } from 'react'
import { useAuth } from '../../store/hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading, error, clearError } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()

    const result = await login(email, password)
    if (!result.payload?.error) {
      navigate('/')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Log In</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          placeholder="your@email.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          placeholder="••••••••"
        />
      </div>

      <button type="submit" disabled={isLoading || !email || !password} className="submit-btn">
        {isLoading ? 'Logging in...' : 'Log In'}
      </button>

      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </form>
  )
}

export default LoginForm
