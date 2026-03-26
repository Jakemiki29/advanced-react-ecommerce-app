import RegisterForm from '../components/Auth/RegisterForm'
import './AuthPages.css'

function RegisterPage() {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <RegisterForm />
      </div>
    </div>
  )
}

export default RegisterPage
