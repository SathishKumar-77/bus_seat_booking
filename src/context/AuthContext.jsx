import { createContext, useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    checkUserLoggedIn()
  }, [])

  const checkUserLoggedIn = () => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setIsLoading(false)
  }
// src/context/AuthContext.jsx
const login = (token, userData) => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(userData))
  setUser(userData)
  
  // All users go to Home page initially
  navigate('/')
}
  
  // Add role check helper
  const isOperator = () => {
    return user?.role === 'BUS_OPERATOR'
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isOperator }}>
    {children}
  </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}