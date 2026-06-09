import React from 'react'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">CRM - Lead Module</div>

      <ul className="sidebar-nav">
        <li>
          <NavLink
            to="/leads"
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            All Leads
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/leads/new"
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            + Add Lead
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
    </div>
  )
}

export default Sidebar