import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { FaEnvelope, FaLock } from 'react-icons/fa'
import AuthLayout from '../components/AuthLayout'

import { useAuth } from '../context/AuthContext'

import '../styles/Auth.css'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const { login } = useAuth()

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (location.state?.registrationSuccess) {
      setShowSuccess(true)
      // Clear the state so message doesn't show on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) 
      newErrors.email = 'Email is invalid'
    if (!formData.password) newErrors.password = 'Password is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }
      
      // Use the auth context login function
      login(data.token, data.user)
    } catch (error) {
      setErrors({ api: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue your journey"
    >
      <form onSubmit={handleSubmit} className="auth-form">
        {errors.api && (
          <div className="alert alert-danger">{errors.api}</div>
        )}
        
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <div className="input-group">
            <span className="input-icon">
              <FaEnvelope />
            </span>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className={errors.email ? 'is-invalid' : ''}
            />
          </div>
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-group">
            <span className="input-icon">
              <FaLock />
            </span>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={errors.password ? 'is-invalid' : ''}
            />
          </div>
          {errors.password && <div className="invalid-feedback">{errors.password}</div>}
        </div>
        
        <div className="auth-options">
          <div className="form-check">
            <input type="checkbox" id="remember" className="form-check-input" />
            <label htmlFor="remember" className="form-check-label">Remember me</label>
          </div>
          <Link to="/forgot-password" className="forgot-password">
            Forgot password?
          </Link>
        </div>
        
        <button 
          type="submit" 
          className="auth-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
        
        <div className="auth-alt">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </div>
      </form>
    </AuthLayout>
  )
}

export default Login