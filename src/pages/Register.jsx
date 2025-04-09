// src/pages/Register.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FaUser, FaEnvelope, FaLock, FaPhone, FaKey } from 'react-icons/fa'
import AuthLayout from '../components/AuthLayout'
import '../styles/Auth.css'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    operatorKey: '',
    isOperator: false
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const toggleOperator = () => {
    setFormData({
      ...formData,
      isOperator: !formData.isOperator,
      operatorKey: ''
    })
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) 
      newErrors.email = 'Email is invalid'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) 
      newErrors.password = 'Password must be at least 6 characters'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    if (formData.isOperator && !formData.operatorKey.trim()) 
      newErrors.operatorKey = 'Operator key is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          operatorKey: formData.isOperator ? formData.operatorKey : undefined
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }
      
      navigate('/login', { state: { registrationSuccess: true } })
    } catch (error) {
      setErrors({ api: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join thousands of happy travelers"
    >
      <form onSubmit={handleSubmit} className="auth-form">
        {errors.api && (
          <div className="alert alert-danger">{errors.api}</div>
        )}
        
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <div className="input-group">
            <span className="input-icon">
              <FaUser />
            </span>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className={errors.name ? 'is-invalid' : ''}
            />
          </div>
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>
        
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
        
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <div className="input-group">
            <span className="input-icon">
              <FaPhone />
            </span>
            <input
              type="tel"
              required
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+8801XXXXXXXXX"
              className={errors.phone ? 'is-invalid' : ''}
            />
          </div>
          {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
        </div>
        
        <div className="form-check mb-3">
          <input
            type="checkbox"
            id="isOperator"
            checked={formData.isOperator}
            onChange={toggleOperator}
            className="form-check-input"
          />
          <label htmlFor="isOperator" className="form-check-label">
            I am a bus operator
          </label>
        </div>
        
        {formData.isOperator && (
          <div className="form-group">
            <label htmlFor="operatorKey">Operator Key</label>
            <div className="input-group">
              <span className="input-icon">
                <FaKey />
              </span>
              <input
                type="text"
                id="operatorKey"
                name="operatorKey"
                value={formData.operatorKey}
                onChange={handleChange}
                placeholder="Enter operator key provided by admin"
                className={errors.operatorKey ? 'is-invalid' : ''}
              />
            </div>
            {errors.operatorKey && (
              <div className="invalid-feedback">{errors.operatorKey}</div>
            )}
          </div>
        )}
        
        <button 
          type="submit" 
          className="auth-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
        
        <div className="auth-alt">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </form>
    </AuthLayout>
  )
}

export default Register