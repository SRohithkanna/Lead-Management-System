import React from 'react'

const badgeClass = {
  New: 'badge-new',
  Contacted: 'badge-contacted',
  Qualified: 'badge-qualified',
  Converted: 'badge-converted',
  Lost: 'badge-lost',
}

const StatusBadge = ({ status }) => {
  return (
    <span className={`badge ${badgeClass[status] || ''}`}>
      {status}
    </span>
  )
}

export default StatusBadge