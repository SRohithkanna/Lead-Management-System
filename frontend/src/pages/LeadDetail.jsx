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
      await fetchLeadById(id)
      setAlert({ msg: 'Status updated.', type: 'success' })
      setTimeout(() => setAlert(null), 3000)
    } catch {
      setAlert({ msg: 'Failed to update status.', type: 'error' })
    }
  }

  if (loading || !selectedLead) return <div className="loader">Loading...</div>

  const lead = selectedLead

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Lead Details</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn" onClick={() => navigate('/leads')}>← Back</button>
          <button className="btn btn-warning" onClick={() => navigate(`/leads/${id}/edit`)}>Edit</button>
          <button className="btn btn-danger" onClick={() => setShowConfirm(true)}>Delete</button>
        </div>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      {/* Flags row */}
      <div className="flags" style={{ marginBottom: '12px' }}>
        {lead.isStale   && <span className="badge badge-stale">⚠ Stale Lead — no update in 30+ days</span>}
        {lead.isOverdue && <span className="badge badge-overdue">⏰ Follow-up Overdue</span>}
      </div>

      {/* Main detail card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{lead.fullName}</span>
          <StatusBadge status={lead.status} />
          <span className="badge badge-score">Score: {lead.score}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '12px', color: '#777' }}>Update Status:</label>
            <select
              value={lead.status}
              onChange={handleStatusChange}
              style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}
            >
              {['New', 'Contacted', 'Qualified', 'Converted', 'Lost'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <table className="detail-table">
          <tbody>
            <tr><td>Lead ID</td><td>{lead.leadId}</td></tr>
            <tr><td>Full Name</td><td>{lead.fullName}</td></tr>
            <tr><td>Email</td><td>{lead.email}</td></tr>
            <tr><td>Contact Number</td><td>{lead.contactNumber || '—'}</td></tr>
            <tr><td>Company Name</td><td>{lead.companyName || '—'}</td></tr>
            <tr><td>Source</td><td>{lead.source}</td></tr>
            <tr><td>Assigned To</td><td>{lead.assignedTo || '—'}</td></tr>
            <tr><td>Remarks</td><td>{lead.remarks || '—'}</td></tr>
            <tr><td>Follow Up Date</td>
              <td>
                {lead.followUpDate
                  ? new Date(lead.followUpDate).toLocaleDateString('en-IN')
                  : '—'}
              </td>
            </tr>
            <tr><td>Days in Status</td><td>{lead.daysInStatus} days</td></tr>
            <tr><td>Last Contacted</td>
              <td>{lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleString('en-IN') : '—'}</td>
            </tr>
            <tr><td>Converted At</td>
              <td>{lead.convertedAt ? new Date(lead.convertedAt).toLocaleString('en-IN') : '—'}</td>
            </tr>
            <tr><td>Status Changed At</td>
              <td>{lead.statusChangedAt ? new Date(lead.statusChangedAt).toLocaleString('en-IN') : '—'}</td>
            </tr>
            <tr><td>Created Date</td><td>{new Date(lead.createdAt).toLocaleString('en-IN')}</td></tr>
            <tr><td>Updated Date</td><td>{new Date(lead.updatedAt).toLocaleString('en-IN')}</td></tr>
          </tbody>
        </table>
      </div>

      {/* Activity log */}
      <div className="card">
        <div className="section-title">Activity Log</div>
        {lead.activityLog && lead.activityLog.length > 0 ? (
          <ul className="activity-log">
            {[...lead.activityLog].reverse().map((log, index) => (
              <li key={index}>
                <span className="activity-action">{log.action}</span>
                <span className="activity-desc">{log.description}</span>
                <span className="activity-time">
                  {new Date(log.performedAt).toLocaleString('en-IN')}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state" style={{ padding: '20px' }}>No activity recorded yet.</div>
        )}
      </div>

      {showConfirm && (
        <ConfirmModal
          message={`Are you sure you want to delete "${lead.fullName}"?`}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  )
}

export default LeadDetail