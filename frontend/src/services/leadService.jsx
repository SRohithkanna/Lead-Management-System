import axios from 'axios'

const API = axios.create({
  baseURL: '/api',
})

// Get all leads (with optional search/filter params)
export const getAllLeads = (params = {}) => API.get('/leads', { params })

// Get single lead by ID
export const getLeadById = (id) => API.get(`/leads/${id}`)

// Create new lead
export const createLead = (data) => API.post('/leads', data)

// Update full lead
export const updateLead = (id, data) => API.put(`/leads/${id}`, data)

// Delete lead
export const deleteLead = (id) => API.delete(`/leads/${id}`)

// Update status only
export const updateLeadStatus = (id, status) =>
  API.patch(`/leads/${id}/status`, { status })

// Download all leads as CSV
export const exportLeadsCSV = () => {
  window.open('/api/leads/export/csv', '_blank')
}

// Download all leads as PDF
export const exportLeadsPDF = () => {
  window.open('/api/leads/export/pdf', '_blank')
}