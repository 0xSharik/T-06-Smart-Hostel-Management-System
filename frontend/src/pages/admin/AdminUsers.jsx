/**
 * src/pages/admin/AdminUsers.jsx — System User Account Management
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Users, UserPlus, Shield, Key, Search, Trash2, X } from "lucide-react";
import { authAPI } from "../../api";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "STUDENT" });

  const registerMutation = useMutation(authAPI.register, {
    onSuccess: () => {
      toast.success("New user account created successfully!");
      setShowModal(false);
      setForm({ name: "", email: "", password: "", role: "STUDENT" });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to create user"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.name) return toast.error("Please fill all required fields");
    registerMutation.mutate(form);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>User Account Management</h1>
          <p>Create and manage user authentication credentials across all roles (Student, Warden, Admin).</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <UserPlus size={18} /> Add User Account
        </button>
      </div>

      <div className="grid-3" style={{ marginBottom: "var(--space-xl)" }}>
        <div className="stat-card">
          <div className="stat-icon indigo"><Users size={22} /></div>
          <div className="stat-info">
            <div className="stat-value">STUDENT</div>
            <div className="stat-label">Student Role</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon emerald"><Shield size={22} /></div>
          <div className="stat-info">
            <div className="stat-value">WARDEN</div>
            <div className="stat-label">Hostel Warden Role</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon violet"><Key size={22} /></div>
          <div className="stat-info">
            <div className="stat-value">ADMIN</div>
            <div className="stat-label">System Admin Role</div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Create User Account</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  placeholder="John Doe"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="user@hostel.com"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">System Role</label>
                <select
                  className="form-select"
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                >
                  <option value="STUDENT">STUDENT</option>
                  <option value="WARDEN">WARDEN</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={registerMutation.isLoading}>
                  {registerMutation.isLoading ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
