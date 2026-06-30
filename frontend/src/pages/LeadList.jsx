import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLeads } from "../context/LeadContext";
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";
import { exportLeadsCSV, exportLeadsPDF } from "../services/leadService";

const STATUSES = ["New", "Contacted", "Qualified", "Converted", "Lost"];
const SOURCES = [
  "Website",
  "Referral",
  "Social Media",
  "Email Campaign",
  "Other",
];
const PAGE_SIZE = 10;

const LeadList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    leads,
    total,
    loading,
    error,
    summary,
    summaryLoading,
    fetchLeads,
    fetchSummary,
    removeLead,
    changeStatus,
  } = useLeads();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [alert, setAlert] = useState(null);

  // Read status from sidebar link
  useEffect(() => {
    const s = searchParams.get("status");
    if (s) setFilterStatus(s);
  }, [searchParams]);

  // Fetch leads on filter/page change
  useEffect(() => {
    const params = { page, limit: PAGE_SIZE };
    if (search) params.search = search;
    if (filterStatus) params.status = filterStatus;
    if (filterSource) params.source = filterSource;
    fetchLeads(params);
  }, [search, filterStatus, filterSource, page, fetchLeads]);

  // Fetch summary once on mount
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleStatusChange = async (id, status) => {
    try {
      await changeStatus(id, status);
      showAlert("Status updated.", "success");
      fetchSummary();
    } catch {
      showAlert("Failed to update status.", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await removeLead(deleteId);
      setDeleteId(null);
      showAlert("Lead deleted.", "success");
      fetchSummary();
    } catch {
      showAlert("Failed to delete lead.", "error");
    }
  };

  const showAlert = (msg, type) => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleClearFilters = () => {
    setSearch("");
    setFilterStatus("");
    setFilterSource("");
    setPage(1);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      {/* Page header */}
   <div className="page-header">
  <h1 className="page-title">All Leads ({total})</h1>
  <div className="page-header-actions">
    <button className="btn" onClick={exportLeadsCSV}>CSV</button>
    <button className="btn" onClick={exportLeadsPDF}>PDF</button>
    <button className="btn btn-primary" onClick={() => navigate('/leads/new')}>
      + Add Lead
    </button>
  </div>
</div>

      {/* Summary cards */}
      {summaryLoading ? (
        <div
          className="loader"
          style={{
            padding: "10px",
            textAlign: "left",
            fontSize: "12px",
            color: "#999",
          }}
        >
          Loading summary...
        </div>
      ) : (
        summary && (
          <>
            <div className="summary-grid">
              <div className="summary-card">
                <div className="s-label">Total Leads</div>
                <div className="s-value">{summary.totalLeads}</div>
              </div>
              <div className="summary-card success">
                <div className="s-label">New This Month</div>
                <div className="s-value">{summary.newThisMonth}</div>
              </div>
              <div className="summary-card warn">
                <div className="s-label">Overdue Follow-ups</div>
                <div className="s-value">{summary.overdueLeads}</div>
              </div>
              <div className="summary-card danger">
                <div className="s-label">Stale Leads</div>
                <div className="s-value">{summary.staleLeads}</div>
              </div>
            </div>

            <div className="status-breakdown">
              {STATUSES.map((s) => (
                <div className="status-breakdown-item" key={s}>
                  <div className="sb-count">{summary.byStatus[s] || 0}</div>
                  <div className="sb-label">{s}</div>
                </div>
              ))}
            </div>
          </>
        )
      )}

      {/* Alerts */}
      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Toolbar */}
      <div className="toolbar">
        <input
          type="text"
          placeholder="Search by name, email, Lead ID..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={filterSource}
          onChange={(e) => {
            setFilterSource(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Sources</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {(search || filterStatus || filterSource) && (
          <button className="btn btn-sm" onClick={handleClearFilters}>
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div className="loader">Loading...</div>
        ) : leads.length === 0 ? (
          <div className="empty-state">No leads found.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Lead ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Source</th>
                <th>Status</th>
                <th>Score</th>
                <th>Follow Up</th>
                <th>Assigned To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead._id}>
                  <td style={{ fontSize: "12px", color: "#777" }}>
                    {lead.leadId}
                  </td>
                  <td>
                    <span
                      style={{
                        color: "#2980b9",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                      onClick={() => navigate(`/leads/${lead._id}`)}
                    >
                      {lead.fullName}
                    </span>
                    <div className="flags">
                      {lead.isStale && (
                        <span className="badge badge-stale">Stale</span>
                      )}
                      {lead.isOverdue && (
                        <span className="badge badge-overdue">Overdue</span>
                      )}
                    </div>
                  </td>
                  <td>{lead.email}</td>
                  <td>{lead.companyName || "—"}</td>
                  <td>{lead.source}</td>
                  <td>
                    <select
                      value={lead.status}
                      onChange={(e) =>
                        handleStatusChange(lead._id, e.target.value)
                      }
                      style={{
                        fontSize: "12px",
                        padding: "2px 4px",
                        border: "1px solid #ccc",
                        borderRadius: "3px",
                      }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className="badge badge-score">{lead.score}</span>
                  </td>
                  <td style={{ fontSize: "12px" }}>
                    {lead.followUpDate
                      ? new Date(lead.followUpDate).toLocaleDateString("en-IN")
                      : "—"}
                  </td>
                  <td>{lead.assignedTo || "—"}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-sm"
                        onClick={() => navigate(`/leads/${lead._id}`)}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => navigate(`/leads/${lead._id}/edit`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => setDeleteId(lead._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={p === page ? "active" : ""}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {deleteId && (
        <ConfirmModal
          message="Are you sure you want to delete this lead? This cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
};

export default LeadList;
