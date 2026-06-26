import axios from 'axios'

// Use the global axios instance so AuthContext token is included
export const getAllLeads = (params = {}) =>
  axios.get('/api/leads', { params })

export const getLeadsSummary = () =>
  axios.get('/api/leads/summary')

export const getLeadById = (id) =>
  axios.get(`/api/leads/${id}`)

export const createLead = (data) =>
  axios.post('/api/leads', data)

export const updateLead = (id, data) =>
  axios.put(`/api/leads/${id}`, data)

export const deleteLead = (id) =>
  axios.delete(`/api/leads/${id}`)

export const updateLeadStatus = (id, status) =>
  axios.patch(`/api/leads/${id}/status`, { status })

export const exportLeadsCSV = () => {
  const token = localStorage.getItem('crm_token')
  window.open(`/api/leads/export/csv?token=${token}`, '_blank')
}

export const exportLeadsPDF = () => {
  const token = localStorage.getItem('crm_token')
  window.open(`/api/leads/export/pdf?token=${token}`, '_blank')
}