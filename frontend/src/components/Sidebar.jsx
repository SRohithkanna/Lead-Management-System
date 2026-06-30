import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Sidebar = () => {
  const { user, logout }            = useAuth()
  const navigate                    = useNavigate()
  const [statusOpen, setStatusOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const closeAll = () => {
    setSidebarOpen(false)
    setStatusOpen(false)
  }

  return (
    <>
      {/* Mobile topbar */}
      <div className="mobile-topbar">
        <span className="mobile-topbar-title">CRM — Lead Module</span>
        <button className="hamburger" onClick={() => setSidebarOpen((p) => !p)}>
          {sidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Dark overlay on mobile when sidebar open */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={closeAll}
      />

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}
        style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      >
        <div className="sidebar-header">CRM — Lead Module</div>

        {/* Main nav */}
        <ul className="sidebar-nav">
          <li>
            <NavLink
              to="/dashboard"
              onClick={closeAll}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/leads"
              onClick={closeAll}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              All Leads
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/leads/new"
              onClick={closeAll}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              + Add Lead
            </NavLink>
          </li>
        </ul>

        {/* Status filter dropdown */}
        <div className="sidebar-section-title">Filter by Status</div>
        <ul className="sidebar-nav">
          <li>
            <div
              onClick={() => setStatusOpen((prev) => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 16px',
                cursor: 'pointer',
                color: '#ccc',
                fontSize: '13px',
                userSelect: 'none',
              }}
            >
              <span>Select Status</span>
              <span style={{ fontSize: '10px' }}>{statusOpen ? '▲' : '▼'}</span>
            </div>

            {statusOpen && (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, background: '#243342' }}>
                {['New', 'Contacted', 'Qualified', 'Converted', 'Lost'].map((s) => (
                  <li key={s}>
                    <NavLink
                      to={`/leads?status=${s}`}
                      onClick={closeAll}
                      style={{
                        display: 'block',
                        padding: '8px 16px 8px 28px',
                        color: '#bbb',
                        fontSize: '12px',
                      }}
                    >
                      {s}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>
        </ul>

        {/* Bottom — settings + user + logout */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid #3d5166' }}>

          {/* Settings */}
          <NavLink
            to="/settings"
            onClick={closeAll}
            className={({ isActive }) => isActive ? 'active' : ''}
            style={{
              display: 'block',
              padding: '10px 16px',
              color: '#ccc',
              fontSize: '13px',
              borderBottom: '1px solid #3d5166',
            }}
          >
            ⚙ Settings
          </NavLink>

          {/* User + logout */}
          <div style={{ padding: '12px 16px 16px' }}>
            <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '2px' }}>
              Logged in as
            </div>
            <div style={{ fontSize: '13px', color: '#fff', fontWeight: 'bold', marginBottom: '10px' }}>
              {user?.name}
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '7px',
                background: 'transparent',
                border: '1px solid #3d5166',
                color: '#ccc',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar