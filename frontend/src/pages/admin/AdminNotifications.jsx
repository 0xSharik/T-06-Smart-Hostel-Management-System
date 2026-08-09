/**
 * src/pages/admin/AdminNotifications.jsx — System Notifications & Broadcast Announcements
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Bell, Send, ShieldAlert, CheckCircle2, Megaphone } from "lucide-react";
import { notificationAPI } from "../../api";
import toast from "react-hot-toast";

export default function AdminNotifications() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", message: "", type: "GENERAL", targetRole: "STUDENT" });

  const broadcastMutation = useMutation(notificationAPI.broadcast, {
    onSuccess: (data) => {
      toast.success(`Broadcast sent to ${data?.data?.data?.sentTo || "all"} ${form.targetRole}s!`);
      setForm({ title: "", message: "", type: "GENERAL", targetRole: "STUDENT" });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Broadcast failed"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.message) return toast.error("Please fill title and message");
    broadcastMutation.mutate(form);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div className="page-header">
        <div>
          <h1>Notifications & System Broadcast</h1>
          <p>Send instant announcements or automated alerts to all Students or Wardens.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Megaphone size={20} color="var(--accent-primary)" /> Create System Broadcast Announcement
          </h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Target Recipient Group</label>
            <select
              className="form-select"
              value={form.targetRole}
              onChange={e => setForm(f => ({ ...f, targetRole: e.target.value }))}
            >
              <option value="STUDENT">All Students</option>
              <option value="WARDEN">All Hostel Wardens</option>
              <option value="ADMIN">All Administrators</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Notification Type</label>
            <select
              className="form-select"
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            >
              <option value="GENERAL">GENERAL Announcement</option>
              <option value="INFO">INFO Notice</option>
              <option value="WARNING">WARNING Advisory</option>
              <option value="ALERT">ALERT Emergency Notice</option>
              <option value="MAINTENANCE">MAINTENANCE Notice</option>
              <option value="MESS">MESS Schedule Update</option>
              <option value="HOLIDAY">HOLIDAY Announcement</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Announcement Title</label>
            <input
              className="form-input"
              placeholder="e.g. Mess Maintenance Notice / Holiday Evacuation"
              required
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Message Details</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Enter message body..."
              required
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              style={{ resize: "vertical" }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.5rem" }}
            disabled={broadcastMutation.isLoading}
          >
            <Send size={16} /> {broadcastMutation.isLoading ? "Sending Broadcast..." : "Send Instant Broadcast"}
          </button>
        </form>
      </div>
    </div>
  );
}
