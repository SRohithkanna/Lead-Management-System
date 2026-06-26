import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLeads } from '../context/LeadContext'
import LeadForm from '../components/LeadForm'
import { getAllLeads } from '../services/leadService'

const AddLead = () => {
  const navigate = useNavigate()
  const { addLead } = useLeads()
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)
  const [duplicateId, setDuplicateId] = useState(null)

  const handleSubmit = async (formData) => {
    setLoading(true)
    setError(null)
    setDuplicateId(null)

    try {
      const lead = await addLead(formData)
      navigate(`/leads/${lead._id}`)
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create lead'
      setError(message)

      // Extract Lead ID from error message e.g. "...(LEAD-0011)"
      const match = message.match(/LEAD-\d+/)
      if (match) {
        const leadId = match[0]
        // Find the actual MongoDB _id by searching with the leadId
        try {
          const res = await getAllLeads({ search: leadId })
          const found = res.data.leads?.[0]
          if (found) setDuplicateId(found._id)
        } catch {
          // If lookup fails, just show the error without the link
        }
      }

      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Add New Lead</h1>
        <button className="btn" onClick={() => navigate('/leads')}>
          ← Back
        </button>
      </div>

      <div className="card">
        {/* Error block with optional View Lead button */}
        {error && (
          <div
            className="alert alert-error"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}
          >
            <span>{error}</span>
            {duplicateId && (
              <button
                className="btn btn-sm"
                style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                onClick={() => navigate(`/leads/${duplicateId}`)}
              >
                View Lead →
              </button>
            )}
          </div>
        )}

        <LeadForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/leads')}
          loading={loading}
        />
      </div>
    </div>
  )
}

export default AddLead