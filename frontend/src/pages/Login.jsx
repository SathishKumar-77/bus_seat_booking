import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { FaEnvelope, FaLock, FaSpinner } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'
import '../styles/Auth.css'


const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const { login } = useAuth()
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [showSuccess, setShowSuccess] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)


  const apiUrl = `${import.meta.env.VITE_API_URL}/api/auth/login`

  console.log("ULR", apiUrl);

  useEffect(() => {
    if (location.state?.registrationSuccess) {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 5000)
      window.history.replaceState({}, document.title)
      return () => clearTimeout(timer)
    }
  }, [location])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) setErrors({ ...errors, [name]: null })
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) 
      newErrors.email = 'Please enter a valid email address'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) 
      newErrors.password = 'Password must be at least 6 characters'
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
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Login failed.')
      login(data.token, data.user)
      navigate('/')
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
      imageSrc="/images/login-illustration.svg"
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
          Sign In
        </motion.h2>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                className="alert alert-success"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                Registration successful! Please log in.
              </motion.div>
            )}
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
            className={`form-group ${errors.email ? 'has-error' : ''}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
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
            transition={{ delay: 0.4 }}
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
            className="form-options"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <label>
              <input type="checkbox" id="remember" />
              <span className="checkmark"></span>
              Remember me
            </label>
            <Link to="/forgot-password">Forgot password?</Link>
          </motion.div>

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
            transition={{ delay: 0.6 }}
          >
            {isLoading ? (
              <>
                <FaSpinner className="spinner" /> Signing In...
              </>
            ) : (
              <>
                Sign In
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
            transition={{ delay: 0.7 }}
          >
            Don't have an account? <Link to="/register">Sign Up</Link>
          </motion.p>
        </form>
      </motion.div>
    </AuthLayout>
  )
}

export default Login