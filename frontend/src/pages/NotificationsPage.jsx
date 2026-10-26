/**
 * src/pages/NotificationsPage.jsx
 */

import { useQuery, useMutation, useQueryClient } from "react-query";
import { Bell, CheckCheck, Trash2, Plus, X, Send } from "lucide-react";
import { notificationAPI } from "../api";
import useAuthStore from "../store/authStore";
import { useState } from "react";
import toast from "react-hot-toast";

const TYPE_STYLES = { INFO: "badge-info", WARNING: "badge-warning", ALERT: "badge-danger", MAINTENANCE: "badge-secondary", MESS: "badge-success", HOLIDAY: "badge-indigo", GENERAL: "badge-secondary" };

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const isAdmin = user?.role === "ADMIN" || user?.role === "WARDEN";
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", type: "GENERAL", targetRole: "STUDENT" });

  const { data, isLoading } = useQuery("notifications", () => notificationAPI.getMyNotifications({ limit: 50 }));
  const notifications = data?.data?.data?.notifications || [];
  const unreadCount = data?.data?.data?.unreadCount || 0;

  const markReadMutation = useMutation(notificationAPI.markAsRead, {
    onSuccess: () => qc.invalidateQueries("notifications"),
  });

  const markAllMutation = useMutation(notificationAPI.markAllAsRead, {
    onSuccess: () => { qc.invalidateQueries("notifications"); toast.success("All marked as read"); },
  });

  const deleteMutation = useMutation(notificationAPI.delete, {
    onSuccess: () => qc.invalidateQueries("notifications"),
  });

  const broadcastMutation = useMutation(notificationAPI.broadcast, {
    onSuccess: (res) => { qc.invalidateQueries("notifications"); setShowModal(false); toast.success(`Sent to ${res.data.data.sentTo} users`); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const fmt = (d) => new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>{unreadCount > 0 ? `${unreadCount} unread notifications` : "You're all caught up!"}</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {unreadCount > 0 && (
            <button className="btn btn-secondary" onClick={() => markAllMutation.mutate()} disabled={markAllMutation.isLoading}>
              <CheckCheck size={18} /> Mark All Read
            </button>
          )}
          {isAdmin && (
            <button id="broadcast-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Send size={18} /> Broadcast
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : notifications.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {notifications.map((n, idx) => (
              <div
                key={n.id}
                style={{
                  display: "flex",
                  gap: "1rem",
                  padding: "1rem 1.5rem",
                  borderBottom: idx < notifications.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  background: n.isRead ? "transparent" : "color-mix(in srgb, var(--accent-primary) 5%, var(--bg-card))",
                  transition: "background 0.2s ease",
                  cursor: !n.isRead ? "pointer" : "default",
                }}
                onClick={() => !n.isRead && markReadMutation.mutate(n.id)}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: "var(--radius-md)",
                  background: n.isRead ? "var(--bg-input)" : "rgba(99,102,241,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  <Bell size={18} color={n.isRead ? "var(--text-muted)" : "var(--accent-primary)"} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                    <div style={{ fontWeight: n.isRead ? 500 : 700, color: "var(--text-primary)", fontSize: "0.9375rem" }}>{n.title}</div>
                    <span className={`badge ${TYPE_STYLES[n.type]}`}>{n.type}</span>
                    {!n.isRead && <div style={{ width: 8, height: 8, background: "var(--accent-primary)", borderRadius: "50%", flexShrink: 0 }} />}
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{n.message}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.375rem" }}>{fmt(n.createdAt)}</div>
                </div>
                <button
                  className="btn btn-icon btn-secondary btn-sm"
                  style={{ alignSelf: "center", flexShrink: 0 }}
                  onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(n.id); }}
                >
                  <Trash2 size={14} color="var(--accent-danger)" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Bell size={40} />
            <h3>No notifications</h3>
            <p>You're all caught up! Check back later.</p>
          </div>
        )}
      </div>

      {/* Broadcast Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Broadcast Notification</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); broadcastMutation.mutate(form); }}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input id="notif-title" className="form-input" placeholder="Notification title..." required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-textarea" rows={3} placeholder="Notification message..." required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} style={{ resize: "vertical" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select id="notif-type" className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {["INFO", "WARNING", "ALERT", "MAINTENANCE", "MESS", "HOLIDAY", "GENERAL"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Send To</label>
                  <select id="notif-role" className="form-select" value={form.targetRole} onChange={e => setForm(f => ({ ...f, targetRole: e.target.value }))}>
                    <option value="STUDENT">All Students</option>
                    <option value="WARDEN">All Wardens</option>
                    <option value="ADMIN">All Admins</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="broadcast-submit" type="submit" className="btn btn-primary" disabled={broadcastMutation.isLoading}>
                  {broadcastMutation.isLoading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <><Send size={16} /> Broadcast</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
