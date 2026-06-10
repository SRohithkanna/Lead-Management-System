import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLeads } from '../context/LeadContext'
import StatusBadge from '../components/StatusBadge'
import ConfirmModal from '../components/ConfirmModal'

const LeadDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedLead, fetchLeadById, removeLead, changeStatus, loading } = useLeads()
  const [showConfirm, setShowConfirm] = useState(false)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    fetchLeadById(id)
  }, [id, fetchLeadById])

  const handleDelete = async () => {
    try {
      await removeLead(id)
      navigate('/leads')
    } catch {
      setAlert({ msg: 'Failed to delete lead.', type: 'error' })
    }
  }

  const handleStatusChange = async (e) => {
    try {
      await changeStatus(id, e.target.value)
      setAlert({ msg: 'Status updated successfully.', type: 'success' })
      setTimeout(() => setAlert(null), 3000)
    } catch {
      setAlert({ msg: 'Failed to update status.', type: 'error' })
    }
  }

  if (loading || !selectedLead) {
    return <div className="loader">Loading...</div>
  }

  const lead = selectedLead

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Lead Details</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn" onClick={() => navigate('/leads')}>
            ← Back
          </button>
          <button
            className="btn btn-warning"
            onClick={() => navigate(`/leads/${id}/edit`)}
          >
            Edit
          </button>
          <button
            className="btn btn-danger"
            onClick={() => setShowConfirm(true)}
          >
            Delete
          </button>
        </div>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`}>{alert.msg}</div>
      )}

      <div className="card">

        {/* Name, badge and inline status update */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
            {lead.fullName}
          </span>
          <StatusBadge status={lead.status} />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '12px', color: '#777' }}>
              Update Status:
            </label>
            <select
              value={lead.status}
              onChange={handleStatusChange}
              style={{
                padding: '4px 8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '13px',
              }}
            >
              {['New', 'Contacted', 'Qualified', 'Converted', 'Lost'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Detail rows */}
        <table className="detail-table">
          <tbody>
            <tr>
              <td>Lead ID</td>
              <td>{lead._id}</td>
            </tr>
            <tr>
              <td>Full Name</td>
              <td>{lead.fullName}</td>
            </tr>
            <tr>
              <td>Email Address</td>
              <td>{lead.email}</td>
            </tr>
            <tr>
              <td>Contact Number</td>
              <td>{lead.contactNumber || '—'}</td>
            </tr>
            <tr>
              <td>Company Name</td>
              <td>{lead.companyName || '—'}</td>
            </tr>
            <tr>
              <td>Source</td>
              <td>{lead.source}</td>
            </tr>
            <tr>
              <td>Assigned To</td>
              <td>{lead.assignedTo || '—'}</td>
            </tr>
            <tr>
              <td>Remarks</td>
              <td>{lead.remarks || '—'}</td>
            </tr>
            <tr>
              <td>Created Date</td>
              <td>{new Date(lead.createdAt).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>Updated Date</td>
              <td>{new Date(lead.updatedAt).toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {showConfirm && (
        <ConfirmModal
          message={`Are you sure you want to delete "${lead.fullName}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  )
}

export default LeadDetail