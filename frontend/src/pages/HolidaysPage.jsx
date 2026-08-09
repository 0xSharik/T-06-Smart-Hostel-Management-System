/**
 * src/pages/HolidaysPage.jsx
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Plus, CalendarDays, Trash2, X } from "lucide-react";
import { holidayAPI } from "../api";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

const TYPE_STYLES = { PUBLIC: "badge-success", RESTRICTED: "badge-warning", HOSTEL_SPECIFIC: "badge-indigo" };

export default function HolidaysPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const isAdmin = user?.role === "ADMIN" || user?.role === "WARDEN";
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", type: "PUBLIC", description: "" });

  const { data, isLoading } = useQuery("holidays", () => holidayAPI.getAll());
  const holidays = data?.data?.data || [];

  const createMutation = useMutation(holidayAPI.create, {
    onSuccess: () => { qc.invalidateQueries("holidays"); setShowModal(false); toast.success("Holiday added"); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const deleteMutation = useMutation(holidayAPI.delete, {
    onSuccess: () => { qc.invalidateQueries("holidays"); toast.success("Holiday removed"); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const getDay = (d) => new Date(d).toLocaleDateString("en-IN", { weekday: "long" });
  const isPast = (d) => new Date(d) < new Date();

  const upcoming = holidays.filter((h) => !isPast(h.date));
  const past = holidays.filter((h) => isPast(h.date));

  const HolidayList = ({ items, title }) => (
    <div className="card" style={{ marginBottom: "var(--space-xl)" }}>
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        <span className="badge badge-secondary">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <div className="empty-state" style={{ padding: "var(--space-xl)" }}>
          <CalendarDays size={32} />
          <p>No holidays here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {items.map((h) => (
            <div key={h.id} style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "0.875rem 1rem",
              background: "rgba(255,255,255,0.02)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              opacity: isPast(h.date) ? 0.6 : 1,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: "var(--radius-md)",
                background: "var(--gradient-brand)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                flexShrink: 0, color: "white"
              }}>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, lineHeight: 1 }}>
                  {new Date(h.date).getDate()}
                </div>
                <div style={{ fontSize: "0.625rem", textTransform: "uppercase", opacity: 0.8 }}>
                  {new Date(h.date).toLocaleString("en-IN", { month: "short" })}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{h.title}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{getDay(h.date)}</div>
                {h.description && <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: 2 }}>{h.description}</div>}
              </div>
              <span className={`badge ${TYPE_STYLES[h.type]}`}>{h.type.replace("_", " ")}</span>
              {isAdmin && (
                <button
                  className="btn btn-icon btn-secondary btn-sm"
                  onClick={() => window.confirm(`Remove "${h.title}"?`) && deleteMutation.mutate(h.id)}
                >
                  <Trash2 size={14} color="var(--accent-danger)" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Holidays</h1>
          <p>View the hostel holiday calendar for the year.</p>
        </div>
        {isAdmin && (
          <button id="add-holiday-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Add Holiday
          </button>
        )}
      </div>

      {isLoading ? <div className="loading-center"><div className="spinner" /></div> : (
        <>
          <HolidayList items={upcoming} title="Upcoming Holidays" />
          <HolidayList items={past} title="Past Holidays" />
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 className="modal-title">Add Holiday</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input id="holiday-title" className="form-input" placeholder="Diwali, Independence Day..." required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input id="holiday-date" type="date" className="form-input" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select id="holiday-type" className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="PUBLIC">Public</option>
                    <option value="RESTRICTED">Restricted</option>
                    <option value="HOSTEL_SPECIFIC">Hostel Specific</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <input className="form-input" placeholder="Additional info..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="holiday-submit" type="submit" className="btn btn-primary" disabled={createMutation.isLoading}>
                  {createMutation.isLoading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : "Add Holiday"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
