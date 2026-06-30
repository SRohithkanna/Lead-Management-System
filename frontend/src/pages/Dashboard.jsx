import React, { useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts'
import { useLeads } from '../context/LeadContext'
import { useAuth } from '../context/AuthContext'

const COLORS = {
  New: '#2980b9', Contacted: '#f39c12',
  Qualified: '#27ae60', Converted: '#1abc9c', Lost: '#e74c3c',
}
const SOURCE_COLORS = ['#2980b9', '#27ae60', '#f39c12', '#e74c3c', '#9b59b6']
const STATUSES = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost']

const Dashboard = () => {
  const { summary, summaryLoading, fetchSummary } = useLeads()
  const { user } = useAuth()

  useEffect(() => { fetchSummary() }, [fetchSummary])

  if (summaryLoading || !summary) {
    return <div className="loader">Loading dashboard...</div>
  }

  const pipelineData = STATUSES.map((name) => ({
    name, value: summary.byStatus?.[name] || 0,
  }))

  const sourceData = Object.entries(summary.bySource || {}).map(([name, value]) => ({
    name, value,
  }))

  const conversionRate = summary.totalLeads > 0
    ? ((summary.byStatus?.Converted || 0) / summary.totalLeads * 100).toFixed(1)
    : 0

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <div style={{ fontSize: '13px', color: '#777' }}>
          Welcome back, <strong>{user?.name}</strong>
        </div>
      </div>

      {/* Stat cards */}
      <div className="dashboard-stats-row">
        {[
          { label: 'Total Leads',     value: summary.totalLeads,     color: '#2c3e50' },
          { label: 'New This Month',  value: summary.newThisMonth,   color: '#2980b9' },
          { label: 'Converted',       value: summary.convertedLeads, color: '#27ae60' },
          { label: 'Conversion Rate', value: `${conversionRate}%`,   color: '#1abc9c' },
        ].map((s) => (
          <div className="card" key={s.label} style={{ marginBottom: 0, textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Warning cards */}
      <div className="dashboard-warning-row">
        <div className="card" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e74c3c' }}>{summary.staleLeads}</div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '13px' }}>Stale Leads</div>
            <div style={{ fontSize: '12px', color: '#777' }}>No update in 30+ days</div>
          </div>
        </div>
        <div className="card" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e67e22' }}>{summary.overdueLeads}</div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '13px' }}>Overdue Follow-ups</div>
            <div style={{ fontSize: '12px', color: '#777' }}>Follow-up date has passed</div>
          </div>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="dashboard-charts-row">
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="section-title" style={{ marginBottom: '16px' }}>Leads by Status</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={pipelineData} margin={{ top: 4, right: 10, left: -20, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {pipelineData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div className="section-title" style={{ marginBottom: '16px' }}>Leads by Source</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={sourceData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {sourceData.map((_, i) => (
                  <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="dashboard-charts-row">
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="section-title" style={{ marginBottom: '16px' }}>Lead Pipeline Flow</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={pipelineData} margin={{ top: 4, right: 10, left: -20, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2980b9"
                strokeWidth={2}
                dot={{ r: 5, fill: '#2980b9' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div className="section-title" style={{ marginBottom: '16px' }}>Status Breakdown</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr>
                {['Status', 'Count', '%'].map((h, i) => (
                  <th key={h} style={{
                    textAlign: i === 0 ? 'left' : 'right',
                    padding: '8px 10px',
                    background: '#f0f0f0',
                    borderBottom: '1px solid #ddd',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pipelineData.map((row, i) => (
                <tr key={row.name} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee' }}>
                    <span style={{
                      display: 'inline-block', width: '10px', height: '10px',
                      borderRadius: '50%', background: COLORS[row.name], marginRight: '8px',
                    }} />
                    {row.name}
                  </td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee', textAlign: 'right', fontWeight: 'bold' }}>
                    {row.value}
                  </td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee', textAlign: 'right', color: '#777' }}>
                    {summary.totalLeads > 0
                      ? ((row.value / summary.totalLeads) * 100).toFixed(1)
                      : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard