import React, { createContext, useContext, useState, useCallback } from 'react'
import {
  getAllLeads,
  getLeadsSummary,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  updateLeadStatus,
} from '../services/leadService'

const LeadContext = createContext()

export const useLeads = () => useContext(LeadContext)

export const LeadProvider = ({ children }) => {
  const [leads, setLeads] = useState([])
  const [selectedLead, setSelectedLead] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)

  // Fetch all leads
  const fetchLeads = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAllLeads(params)
      setLeads(res.data.leads)
      setTotal(res.data.total)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leads')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true)
    try {
      const res = await getLeadsSummary()
      setSummary(res.data.summary)
    } catch (err) {
      console.error('Failed to fetch summary:', err)
    } finally {
      setSummaryLoading(false)
    }
  }, [])

  // Fetch single lead
  const fetchLeadById = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getLeadById(id)
      setSelectedLead(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch lead')
    } finally {
      setLoading(false)
    }
  }, [])

  // Create lead
  const addLead = useCallback(async (data) => {
    const res = await createLead(data)
    return res.data
  }, [])

  // Update lead
  const editLead = useCallback(async (id, data) => {
    const res = await updateLead(id, data)
    return res.data
  }, [])

  // Delete lead
  const removeLead = useCallback(async (id) => {
    await deleteLead(id)
    setLeads((prev) => prev.filter((l) => l._id !== id))
  }, [])

  // Update status only
  const changeStatus = useCallback(async (id, status) => {
    const res = await updateLeadStatus(id, status)
    setLeads((prev) =>
      prev.map((l) => (l._id === id ? { ...l, status } : l))
    )
    return res.data
  }, [])

  return (
    <LeadContext.Provider
      value={{
        leads,
        selectedLead,
        summary,
        loading,
        summaryLoading,
        error,
        total,
        fetchLeads,
        fetchSummary,
        fetchLeadById,
        addLead,
        editLead,
        removeLead,
        changeStatus,
        setError,
      }}
    >
      {children}
    </LeadContext.Provider>
  )
}