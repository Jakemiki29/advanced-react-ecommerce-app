import LoginForm from '../components/Auth/LoginForm'
import './AuthPages.css'

function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <LoginForm />
      </div>
    </div>
  )
}

export default LoginPage
