import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Sidebar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="sidebar-header">CRM — Lead Module</div>

      <ul className="sidebar-nav">
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/leads" className={({ isActive }) => isActive ? 'active' : ''}>
            All Leads
          </NavLink>
        </li>
        <li>
          <NavLink to="/leads/new" className={({ isActive }) => isActive ? 'active' : ''}>
            + Add Lead
          </NavLink>
        </li>
        <li>
          <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>
            Settings
          </NavLink>
        </li>
      </ul>

      <div className="sidebar-section-title">Filter by Status</div>
      <ul className="sidebar-nav">
        <li><NavLink to="/leads?status=New">New</NavLink></li>
        <li><NavLink to="/leads?status=Contacted">Contacted</NavLink></li>
        <li><NavLink to="/leads?status=Qualified">Qualified</NavLink></li>
        <li><NavLink to="/leads?status=Converted">Converted</NavLink></li>
        <li><NavLink to="/leads?status=Lost">Lost</NavLink></li>
      </ul>

      {/* User info + logout at bottom */}
      <div style={{ marginTop: 'auto', borderTop: '1px solid #3d5166', padding: '14px 16px' }}>
        <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '2px' }}>
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
  )
}

export default Sidebar