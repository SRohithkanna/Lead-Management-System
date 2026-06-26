import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Load user from localStorage on app start
  useEffect(() => {
    const stored = localStorage.getItem('crm_user')
    const token  = localStorage.getItem('crm_token')
    if (stored && token) {
      setUser(JSON.parse(stored))
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password })
    const { user, token } = res.data
    localStorage.setItem('crm_user',  JSON.stringify(user))
    localStorage.setItem('crm_token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    return user
  }

  const logout = () => {
    localStorage.removeItem('crm_user')
    localStorage.removeItem('crm_token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  const updateUser = (updatedUser, newToken) => {
    localStorage.setItem('crm_user',  JSON.stringify(updatedUser))
    localStorage.setItem('crm_token', newToken)
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}