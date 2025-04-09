import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import '../styles/Auth.css'

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="auth-card"
        >
          <div className="auth-header">
            <h2 className="auth-title">{title}</h2>
            <p className="auth-subtitle">{subtitle}</p>
          </div>
          {children}
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="auth-footer"
        >
          <Link to="/" className="back-home">
            ← Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default AuthLayout