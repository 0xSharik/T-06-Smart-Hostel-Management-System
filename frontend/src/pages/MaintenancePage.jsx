/**
 * src/pages/MaintenancePage.jsx
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Plus, Wrench, X, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { maintenanceAPI } from "../api";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

const STATUS_STYLES = { PENDING: "badge-warning", IN_PROGRESS: "badge-indigo", RESOLVED: "badge-success", REJECTED: "badge-danger" };
const PRIORITY_STYLES = { LOW: "badge-secondary", MEDIUM: "badge-info", HIGH: "badge-warning", URGENT: "badge-danger" };

export default function MaintenancePage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN" || user?.role === "WARDEN";
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({ status: "", priority: "" });
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [form, setForm] = useState({ title: "", description: "", category: "OTHER", priority: "MEDIUM" });

  const { data, isLoading } = useQuery(
    ["maintenance", page, filter],
    () => maintenanceAPI.getAll({ page, limit: 10, ...filter }),
    { keepPreviousData: true }
  );

  const createMutation = useMutation(maintenanceAPI.create, {
    onSuccess: () => { qc.invalidateQueries("maintenance"); setShowModal(false); toast.success("Request submitted"); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const updateStatusMutation = useMutation(({ id, data }) => maintenanceAPI.updateStatus(id, data), {
    onSuccess: () => { qc.invalidateQueries("maintenance"); setSelectedId(null); toast.success("Status updated"); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const requests = data?.data?.data;
  const meta = data?.data?.meta;
  const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Maintenance</h1>
          <p>Track and resolve hostel maintenance requests.</p>
        </div>
        <button id="add-maintenance-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Request
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select id="maint-status-filter" className="form-select" style={{ width: 180 }} value={filter.status} onChange={e => { setFilter(f => ({ ...f, status: e.target.value })); setPage(1); }}>
          <option value="">All Statuses</option>
          {["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select id="maint-priority-filter" className="form-select" style={{ width: 160 }} value={filter.priority} onChange={e => { setFilter(f => ({ ...f, priority: e.target.value })); setPage(1); }}>
          <option value="">All Priorities</option>
          {["LOW", "MEDIUM", "HIGH", "URGENT"].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Issue</th>
                <th>Category</th>
                <th>By</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
                {isAdmin && <th>Update</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7}><div className="loading-center"><div className="spinner" /></div></td></tr>
              ) : requests?.length > 0 ? (
                requests.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 500, color: "var(--text-primary)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</div>
                      {r.room && <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Room {r.room.roomNo}</div>}
                    </td>
                    <td><span className="badge badge-secondary">{r.category}</span></td>
                    <td style={{ fontSize: "0.875rem" }}>{r.user?.name}</td>
                    <td><span className={`badge ${PRIORITY_STYLES[r.priority]}`}>{r.priority}</span></td>
                    <td><span className={`badge ${STATUS_STYLES[r.status]}`}>{r.status}</span></td>
                    <td style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{fmt(r.createdAt)}</td>
                    {isAdmin && (
                      <td>
                        {r.status !== "RESOLVED" && r.status !== "REJECTED" && (
                          <button
                            id={`update-status-${r.id}`}
                            className="btn btn-secondary btn-sm"
                            onClick={() => { setSelectedId(r.id); setNewStatus(r.status); setRemarks(""); }}
                          >
                            Update
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <Wrench size={40} />
                    <h3>No maintenance requests</h3>
                    <p>All is running smoothly!</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {meta && (
          <div className="pagination">
            <span className="pagination-info">Showing {requests?.length || 0} of {meta.total}</span>
            <div className="pagination-controls">
              <button className="btn btn-secondary btn-sm" disabled={!meta.hasPrevPage} onClick={() => setPage(p => p - 1)}>Previous</button>
              <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Page {meta.page} of {meta.totalPages}</span>
              <button className="btn btn-secondary btn-sm" disabled={!meta.hasNextPage} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">New Maintenance Request</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input id="maint-title" className="form-input" placeholder="Broken fan, Leaking pipe..." required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows={3} placeholder="Describe the issue in detail..." required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: "vertical" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select id="maint-category" className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {["ELECTRICAL", "PLUMBING", "FURNITURE", "CLEANING", "INTERNET", "AC", "OTHER"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select id="maint-priority" className="form-select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    {["LOW", "MEDIUM", "HIGH", "URGENT"].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="maint-submit" type="submit" className="btn btn-primary" disabled={createMutation.isLoading}>
                  {createMutation.isLoading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {selectedId && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedId(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3 className="modal-title">Update Status</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setSelectedId(null)}><X size={18} /></button>
            </div>
            <div className="form-group">
              <label className="form-label">New Status</label>
              <select id="status-update-select" className="form-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                {["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Remarks (optional)</label>
              <textarea className="form-textarea" rows={2} placeholder="Add remarks..." value={remarks} onChange={e => setRemarks(e.target.value)} style={{ resize: "none" }} />
            </div>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setSelectedId(null)}>Cancel</button>
              <button
                id="status-update-submit"
                className="btn btn-primary"
                onClick={() => updateStatusMutation.mutate({ id: selectedId, data: { status: newStatus, remarks } })}
                disabled={updateStatusMutation.isLoading}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
