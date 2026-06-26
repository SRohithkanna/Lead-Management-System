import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const Settings = () => {
  const { user, updateUser } = useAuth()

  const [profileForm, setProfileForm] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  })

  const [profileAlert, setProfileAlert]   = useState(null)
  const [passwordAlert, setPasswordAlert] = useState(null)
  const [profileLoading, setProfileLoading]   = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const showAlert = (setter, msg, type) => {
    setter({ msg, type })
    setTimeout(() => setter(null), 4000)
  }

  // ── Update name/email ──────────────────────────────────
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    if (!profileForm.name || !profileForm.email) {
      showAlert(setProfileAlert, 'Name and email are required', 'error')
      return
    }
    setProfileLoading(true)
    try {
      const res = await axios.put('/api/auth/update', {
        name:  profileForm.name,
        email: profileForm.email,
      })
      updateUser(res.data.user, res.data.token)
      showAlert(setProfileAlert, 'Profile updated successfully', 'success')
    } catch (err) {
      showAlert(setProfileAlert, err.response?.data?.message || 'Failed to update profile', 'error')
    } finally {
      setProfileLoading(false)
    }
  }

  // ── Update password ────────────────────────────────────
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showAlert(setPasswordAlert, 'All password fields are required', 'error')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showAlert(setPasswordAlert, 'New password and confirm password do not match', 'error')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      showAlert(setPasswordAlert, 'New password must be at least 6 characters', 'error')
      return
    }
    setPasswordLoading(true)
    try {
      const res = await axios.put('/api/auth/update', {
        currentPassword: passwordForm.currentPassword,
        newPassword:     passwordForm.newPassword,
      })
      updateUser(res.data.user, res.data.token)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      showAlert(setPasswordAlert, 'Password updated successfully', 'success')
    } catch (err) {
      showAlert(setPasswordAlert, err.response?.data?.message || 'Failed to update password', 'error')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      {/* Account info */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="section-title" style={{ marginBottom: '16px' }}>
          Account Information
        </div>
        <table className="detail-table">
          <tbody>
            <tr><td>Name</td><td>{user?.name}</td></tr>
            <tr><td>Email</td><td>{user?.email}</td></tr>
            <tr><td>Role</td><td style={{ textTransform: 'capitalize' }}>{user?.role}</td></tr>
          </tbody>
        </table>
      </div>

      {/* Update profile */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="section-title" style={{ marginBottom: '16px' }}>
          Update Profile
        </div>
        {profileAlert && (
          <div className={`alert alert-${profileAlert.type}`}>{profileAlert.msg}</div>
        )}
        <form onSubmit={handleProfileSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Your full name"
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="your@email.com"
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={profileLoading}
          >
            {profileLoading ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>

      {/* Update password */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: '16px' }}>
          Change Password
        </div>
        {passwordAlert && (
          <div className={`alert alert-${passwordAlert.type}`}>{passwordAlert.msg}</div>
        )}
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
              placeholder="Enter current password"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="Min 6 characters"
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Repeat new password"
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={passwordLoading}
          >
            {passwordLoading ? 'Saving...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Settings