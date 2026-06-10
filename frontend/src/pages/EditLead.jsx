import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLeads } from '../context/LeadContext'
import LeadForm from '../components/LeadForm'

const EditLead = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedLead, fetchLeadById, editLead, loading } = useLeads()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLeadById(id)
  }, [id, fetchLeadById])

  const handleSubmit = async (formData) => {
    setSaving(true)
    setError(null)
    try {
      await editLead(id, formData)
      navigate(`/leads/${id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update lead')
      setSaving(false)
    }
  }

  if (loading && !selectedLead) {
    return <div className="loader">Loading lead...</div>
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Edit Lead</h1>
        <button className="btn" onClick={() => navigate(`/leads/${id}`)}>
          ← Back
        </button>
      </div>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        <LeadForm
          initialData={selectedLead}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/leads/${id}`)}
          loading={saving}
        />
      </div>
    </div>
  )
}

export default EditLead