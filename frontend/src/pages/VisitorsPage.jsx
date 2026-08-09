/**
 * src/pages/VisitorsPage.jsx
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Plus, UserCheck, X, LogOut, QrCode, DoorOpen, Clock3 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { visitorAPI } from "../api";
import toast from "react-hot-toast";

export default function VisitorsPage() {
  const qc = useQueryClient();
  const { pathname } = useLocation();
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ studentId: "", name: "", phone: "", relation: "", purpose: "" });

  const { data, isLoading } = useQuery(
    ["visitors", page],
    () => visitorAPI.getAll({ page, limit: 10 }),
    { keepPreviousData: true }
  );

  const logEntryMutation = useMutation(visitorAPI.logEntry, {
    onSuccess: () => { qc.invalidateQueries("visitors"); setShowModal(false); toast.success("Visitor entry logged"); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const logExitMutation = useMutation(visitorAPI.logExit, {
    onSuccess: () => { qc.invalidateQueries("visitors"); toast.success("Exit time recorded"); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const visitors = data?.data?.data;
  const meta = data?.data?.meta;
  const showQrOption = pathname.startsWith("/warden/");
  const activeVisitors = visitors?.filter((visitor) => !visitor.outTime).length || 0;
  const qrPasses = visitors?.filter((visitor) => visitor.qrToken).length || 0;

  const fmt = (d) => d ? new Date(d).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }) : "—";

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Visitor Dashboard</h1>
          <p>Handle walk-ins, QR visitor passes, current entries, and exit logging from one place.</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {showQrOption && (
            <Link to="/warden/qr-scan" className="btn btn-secondary">
              <QrCode size={18} /> QR Scanner
            </Link>
          )}
          <button id="log-visitor-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Log Visitor
          </button>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: "var(--space-xl)" }}>
        <div className="stat-card compact-stat">
          <div className="stat-icon blue"><UserCheck size={22} /></div>
          <div className="stat-info">
            <div className="stat-value">{meta?.total ?? "—"}</div>
            <div className="stat-label">Visitor Records</div>
          </div>
        </div>
        <div className="stat-card compact-stat">
          <div className="stat-icon emerald"><DoorOpen size={22} /></div>
          <div className="stat-info">
            <div className="stat-value">{activeVisitors}</div>
            <div className="stat-label">Currently Inside</div>
          </div>
        </div>
        <div className="stat-card compact-stat">
          <div className="stat-icon amber"><QrCode size={22} /></div>
          <div className="stat-info">
            <div className="stat-value">{qrPasses}</div>
            <div className="stat-label">QR Pass Records</div>
          </div>
        </div>
      </div>

      <div className="visitor-action-grid">
        <button type="button" className="visitor-action-card" onClick={() => setShowModal(true)}>
          <Plus size={22} />
          <span>
            <strong>Manual Visitor Entry</strong>
            <small>Register a walk-in visitor at the gate.</small>
          </span>
        </button>
        {showQrOption && (
          <Link to="/warden/qr-scan" className="visitor-action-card">
            <QrCode size={22} />
            <span>
              <strong>Visitor Pass & Scanner</strong>
              <small>Generate a signed pass or verify a QR token.</small>
            </span>
          </Link>
        )}
        <div className="visitor-action-card muted">
          <Clock3 size={22} />
          <span>
            <strong>Offline fallback</strong>
            <small>Paste token text from a barcode scanner when camera access is unavailable.</small>
          </span>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="card-header table-card-header">
          <h3 className="card-title">Recent Visitor Activity</h3>
          <span className="badge badge-secondary">Live log</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Visitor</th>
                <th>Student</th>
                <th>Room</th>
                <th>Relation</th>
                <th>In Time</th>
                <th>Out Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7}><div className="loading-center"><div className="spinner" /></div></td></tr>
              ) : visitors?.length > 0 ? (
                visitors.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>{v.name}</div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{v.phone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>{v.student?.user?.name}</div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{v.student?.rollNo}</div>
                    </td>
                    <td>{v.student?.room?.roomNo || "—"}</td>
                    <td><span className="badge badge-secondary">{v.relation}</span></td>
                    <td style={{ fontSize: "0.875rem" }}>{fmt(v.inTime)}</td>
                    <td>
                      {v.outTime ? (
                        <span style={{ fontSize: "0.875rem" }}>{fmt(v.outTime)}</span>
                      ) : (
                        <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <div style={{ width: 6, height: 6, background: "#10b981", borderRadius: "50%", animation: "pulse 2s infinite" }} />
                          Inside
                        </span>
                      )}
                    </td>
                    <td>
                      {!v.outTime && (
                        <button
                          id={`exit-visitor-${v.id}`}
                          className="btn btn-secondary btn-sm"
                          onClick={() => logExitMutation.mutate(v.id)}
                          disabled={logExitMutation.isLoading}
                        >
                          <LogOut size={14} /> Exit
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <UserCheck size={40} />
                    <h3>No visitors today</h3>
                    <p>Log visitor entries when they arrive.</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {meta && (
          <div className="pagination">
            <span className="pagination-info">Showing {visitors?.length || 0} of {meta.total} records</span>
            <div className="pagination-controls">
              <button className="btn btn-secondary btn-sm" disabled={!meta.hasPrevPage} onClick={() => setPage(p => p - 1)}>Previous</button>
              <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Page {meta.page} of {meta.totalPages}</span>
              <button className="btn btn-secondary btn-sm" disabled={!meta.hasNextPage} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Log Entry Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Log Visitor Entry</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); logEntryMutation.mutate(form); }}>
              <div className="form-group">
                <label className="form-label">Student ID</label>
                <input id="visitor-studentId" className="form-input" placeholder="Student profile ID" required value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Visitor Name</label>
                  <input id="visitor-name" className="form-input" placeholder="Full name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input id="visitor-phone" className="form-input" placeholder="9876543210" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Relation to Student</label>
                <input id="visitor-relation" className="form-input" placeholder="Father / Mother / Sibling / Friend" required value={form.relation} onChange={e => setForm(f => ({ ...f, relation: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Purpose (optional)</label>
                <input className="form-input" placeholder="Reason for visit" value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="visitor-log-submit" type="submit" className="btn btn-primary" disabled={logEntryMutation.isLoading}>
                  {logEntryMutation.isLoading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : "Log Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
