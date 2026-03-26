import { useState } from 'react'
import { useAuth } from '../../store/hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'

function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const { register, isLoading, error, clearError } = useAuth()
  const navigate = useNavigate()

  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return false
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return false
    }
    setPasswordError('')
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()

    if (!validatePasswords()) {
      return
    }

    const result = await register(email, password, displayName)
    if (!result.payload?.error) {
      navigate('/')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Create Account</h2>

      {error && <div className="error-message">{error}</div>}
      {passwordError && <div className="error-message">{passwordError}</div>}

      <div className="form-group">
        <label htmlFor="displayName">Full Name</label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          disabled={isLoading}
          placeholder="John Doe"
        />
      </div>

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

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading}
          placeholder="••••••••"
        />
      </div>

      <button type="submit" disabled={isLoading || !email || !password || !confirmPassword || !displayName} className="submit-btn">
        {isLoading ? 'Creating account...' : 'Register'}
      </button>

      <p>
        Already have an account? <Link to="/login">Log in here</Link>
      </p>
    </form>
  )
}

export default RegisterForm
