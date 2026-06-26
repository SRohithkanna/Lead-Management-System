import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LeadProvider } from './context/LeadContext'
import PrivateRoute from './components/PrivateRoute'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import LeadList from './pages/LeadList'
import AddLead from './pages/AddLead'
import EditLead from './pages/EditLead'
import LeadDetail from './pages/LeadDetail'
import Settings from './pages/Settings'

// Layout wrapper — sidebar + content
const AppLayout = ({ children }) => (
  <div className="layout">
    <Sidebar />
    <main className="main-content">{children}</main>
  </div>
)

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LeadProvider>
          <Routes>

            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <AppLayout><Dashboard /></AppLayout>
              </PrivateRoute>
            } />
            <Route path="/leads" element={
              <PrivateRoute>
                <AppLayout><LeadList /></AppLayout>
              </PrivateRoute>
            } />
            <Route path="/leads/new" element={
              <PrivateRoute>
                <AppLayout><AddLead /></AppLayout>
              </PrivateRoute>
            } />
            <Route path="/leads/:id" element={
              <PrivateRoute>
                <AppLayout><LeadDetail /></AppLayout>
              </PrivateRoute>
            } />
            <Route path="/leads/:id/edit" element={
              <PrivateRoute>
                <AppLayout><EditLead /></AppLayout>
              </PrivateRoute>
            } />
            <Route path="/settings" element={
              <PrivateRoute>
                <AppLayout><Settings /></AppLayout>
              </PrivateRoute>
            } />

            {/* Default */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />

          </Routes>
        </LeadProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App