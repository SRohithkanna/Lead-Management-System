import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLeads } from '../context/LeadContext'
import LeadForm from '../components/LeadForm'

const AddLead = () => {
  const navigate = useNavigate()
  const { addLead } = useLeads()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (formData) => {
    setLoading(true)
    setError(null)
    try {
      const lead = await addLead(formData)
      navigate(`/leads/${lead._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create lead')
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
        {error && <div className="alert alert-error">{error}</div>}
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