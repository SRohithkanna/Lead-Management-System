import React, { useState, useEffect } from 'react'

const STATUSES = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost']
const SOURCES = ['Website', 'Referral', 'Social Media', 'Email Campaign', 'Other']

const emptyForm = {
  fullName: '',
  email: '',
  contactNumber: '',
  companyName: '',
  source: 'Website',
  status: 'New',
  assignedTo: '',
  remarks: '',
}

const LeadForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setForm({
        fullName: initialData.fullName || '',
        email: initialData.email || '',
        contactNumber: initialData.contactNumber || '',
        companyName: initialData.companyName || '',
        source: initialData.source || 'Website',
        status: initialData.status || 'New',
        assignedTo: initialData.assignedTo || '',
        remarks: initialData.remarks || '',
      })
    }
  }, [initialData])

  const validate = () => {
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Full name is required'
    if (!form.email.trim()) {
      errs.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Enter a valid email'
    }
    if (
      form.contactNumber &&
      !/^\+?[\d\s\-]{7,15}$/.test(form.contactNumber)
    ) {
      errs.contactNumber = 'Enter a valid contact number'
    }
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Full Name *</label>
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="e.g. Aarav Mehta"
          />
          {errors.fullName && (
            <div className="form-error">{errors.fullName}</div>
          )}
        </div>
        <div className="form-group">
          <label>Email Address *</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="e.g. aarav@company.com"
          />
          {errors.email && (
            <div className="form-error">{errors.email}</div>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Contact Number</label>
          <input
            name="contactNumber"
            value={form.contactNumber}
            onChange={handleChange}
            placeholder="+91 98765 43210"
          />
          {errors.contactNumber && (
            <div className="form-error">{errors.contactNumber}</div>
          )}
        </div>
        <div className="form-group">
          <label>Company Name</label>
          <input
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            placeholder="Company Pvt. Ltd."
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Source</label>
          <select name="source" value={form.source} onChange={handleChange}>
            {SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Assigned To</label>
        <input
          name="assignedTo"
          value={form.assignedTo}
          onChange={handleChange}
          placeholder="Sales rep name"
        />
      </div>

      <div className="form-group">
        <label>Remarks</label>
        <textarea
          name="remarks"
          value={form.remarks}
          onChange={handleChange}
          placeholder="Any notes about this lead..."
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Lead'}
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default LeadForm