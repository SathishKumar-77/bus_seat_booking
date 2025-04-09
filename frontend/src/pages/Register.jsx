import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FaUser, FaEnvelope, FaLock, FaPhone, FaKey, FaSpinner } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const navigate = useNavigate()

  const apiUrl = `https://${import.meta.env.VITE_API_URL}/api/auth/register`

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) setErrors({ ...errors, [name]: null })
  }

  const toggleOperator = () => {
    setFormData({ ...formData, isOperator: !formData.isOperator, operatorKey: '' })
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Full name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) 
      newErrors.email = 'Please enter a valid email address'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) 
      newErrors.password = 'Password must be at least 6 characters'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
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
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          operatorKey: formData.isOperator ? formData.operatorKey : undefined
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Registration failed.')
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
      imageSrc="/images/register-illustration.svg"
    >
      <motion.div 
        className="auth-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2 
          className="auth-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Sign Up
        </motion.h2>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <AnimatePresence>
            {errors.api && (
              <motion.div
                className="alert alert-danger"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {errors.api}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            className={`form-group ${errors.name ? 'has-error' : ''}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
              <div className="input-highlight"></div>
            </div>
            <AnimatePresence>
              {errors.name && (
                <motion.span 
                  className="error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {errors.name}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div 
            className={`form-group ${errors.email ? 'has-error' : ''}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
              />
              <div className="input-highlight"></div>
            </div>
            <AnimatePresence>
              {errors.email && (
                <motion.span 
                  className="error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {errors.email}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div 
            className={`form-group ${errors.password ? 'has-error' : ''}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type={passwordVisible ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              <div className="input-highlight"></div>
              <button
                type="button"
                className="toggle-password"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? 'Hide' : 'Show'}
              </button>
            </div>
            <AnimatePresence>
              {errors.password && (
                <motion.span 
                  className="error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {errors.password}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div 
            className={`form-group ${errors.phone ? 'has-error' : ''}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label htmlFor="phone">Phone Number</label>
            <div className="input-wrapper">
              <FaPhone className="input-icon" />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 XXXXXXXXXX"
                required
              />
              <div className="input-highlight"></div>
            </div>
            <AnimatePresence>
              {errors.phone && (
                <motion.span 
                  className="error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {errors.phone}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div 
            className="form-group checkbox-group"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <label className="checkbox-label">
              <input
                type="checkbox"
                id="isOperator"
                checked={formData.isOperator}
                onChange={toggleOperator}
              />
              <span className="checkmark"></span>
              <span>I am a bus operator</span>
            </label>
          </motion.div>

          <AnimatePresence>
            {formData.isOperator && (
              <motion.div 
                className={`form-group ${errors.operatorKey ? 'has-error' : ''}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label htmlFor="operatorKey">Operator Key</label>
                <div className="input-wrapper">
                  <FaKey className="input-icon" />
                  <input
                    type="text"
                    id="operatorKey"
                    name="operatorKey"
                    value={formData.operatorKey}
                    onChange={handleChange}
                    placeholder="Enter operator key"
                    required
                  />
                  <div className="input-highlight"></div>
                </div>
                <AnimatePresence>
                  {errors.operatorKey && (
                    <motion.span 
                      className="error"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {errors.operatorKey}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className="auth-btn"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {isLoading ? (
              <>
                <FaSpinner className="spinner" /> Creating Account...
              </>
            ) : (
              <>
                Create Account
                {isHovered && (
                  <motion.span 
                    className="btn-ripple"
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                )}
              </>
            )}
          </motion.button>

          <motion.p 
            className="auth-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            Already have an account? <Link to="/login">Sign In</Link>
          </motion.p>
        </form>
      </motion.div>
    </AuthLayout>
  )
}

export default Register