// ── Activity actions ─────────────────────────────────────
export const ACTIONS = {
  LEAD_CREATED: 'Lead Created',
  STATUS_CHANGED: 'Status Changed',
  LEAD_UPDATED: 'Lead Updated',
  FOLLOW_UP_SET: 'Follow Up Set',
  LEAD_CONVERTED: 'Lead Converted',
  LEAD_LOST: 'Lead Lost',
  LEAD_CONTACTED: 'Lead Contacted',
}

// ── Push a new activity entry into the lead's log ────────
export const logActivity = (lead, action, description) => {
  lead.activityLog.push({
    action,
    description,
    performedAt: new Date(),
  })
}

// ── Build status change description ─────────────────────
export const buildStatusDescription = (oldStatus, newStatus) => {
  return `Status changed from "${oldStatus}" to "${newStatus}"`
}

// ── Build update description ─────────────────────────────
export const buildUpdateDescription = (updatedFields) => {
  const fields = updatedFields.join(', ')
  return `Lead details updated — fields changed: ${fields}`
}