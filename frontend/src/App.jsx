import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LeadProvider } from './context/LeadContext'
import Sidebar from './components/Sidebar'
import LeadList from './pages/LeadList'
import AddLead from './pages/AddLead'
import EditLead from './pages/EditLead'
import LeadDetail from './pages/LeadDetail'

const App = () => {
  return (
    <BrowserRouter>
      <LeadProvider>
        <div className="layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/leads" replace />} />
              <Route path="/leads" element={<LeadList />} />
              <Route path="/leads/new" element={<AddLead />} />
              <Route path="/leads/:id" element={<LeadDetail />} />
              <Route path="/leads/:id/edit" element={<EditLead />} />
            </Routes>
          </main>
        </div>
      </LeadProvider>
    </BrowserRouter>
  )
}

export default App