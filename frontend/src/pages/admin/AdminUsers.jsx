/**
 * src/pages/admin/AdminUsers.jsx — System User Account Management
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Users, UserPlus, Shield, Key, Search, X, Eye } from "lucide-react";
import { userAPI } from "../../api";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "STUDENT" });

  const { data: usersRes, isLoading, isError, error } = useQuery(
    ["admin-users", page, search, role],
    () => userAPI.getAll({ page, limit: 20, search: search.trim(), role: role || undefined }),
    { keepPreviousData: true }
  );
  const users = usersRes?.data?.data || [];
  const meta = usersRes?.data?.meta;

  const registerMutation = useMutation(userAPI.create, {
    onSuccess: () => {
      toast.success("New user account created successfully!");
      qc.invalidateQueries("admin-users");
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

      <div className="grid-4" style={{ marginBottom: "var(--space-xl)" }}>
        <button type="button" className="stat-card" aria-pressed={!role} onClick={() => { setRole(""); setPage(1); }} style={{ textAlign: "left", cursor: "pointer", borderColor: !role ? "var(--accent-primary)" : undefined }}><div className="stat-icon indigo"><Users size={22} /></div><div className="stat-info"><div className="stat-value">{meta?.total ?? "—"}</div><div className="stat-label">All Accounts</div></div></button>
        <button type="button" className="stat-card" aria-pressed={role === "STUDENT"} onClick={() => { setRole("STUDENT"); setPage(1); }} style={{ textAlign: "left", cursor: "pointer", borderColor: role === "STUDENT" ? "var(--accent-primary)" : undefined }}><div className="stat-icon indigo"><Users size={22} /></div><div className="stat-info"><div className="stat-value">STUDENT</div><div className="stat-label">View student accounts</div></div></button>
        <button type="button" className="stat-card" aria-pressed={role === "WARDEN"} onClick={() => { setRole("WARDEN"); setPage(1); }} style={{ textAlign: "left", cursor: "pointer", borderColor: role === "WARDEN" ? "var(--accent-primary)" : undefined }}><div className="stat-icon emerald"><Shield size={22} /></div><div className="stat-info"><div className="stat-value">WARDEN</div><div className="stat-label">View warden accounts</div></div></button>
        <button type="button" className="stat-card" aria-pressed={role === "ADMIN"} onClick={() => { setRole("ADMIN"); setPage(1); }} style={{ textAlign: "left", cursor: "pointer", borderColor: role === "ADMIN" ? "var(--accent-primary)" : undefined }}><div className="stat-icon violet"><Key size={22} /></div><div className="stat-info"><div className="stat-value">ADMIN</div><div className="stat-label">View admin accounts</div></div></button>
      </div>

      <div className="card" style={{ padding: 0, marginBottom: "var(--space-xl)" }}>
        <div style={{ padding: "1rem 1.25rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", borderBottom: "1px solid var(--border-subtle)" }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 220 }}><Search size={16} /><input className="form-input search-input" placeholder="Search name, email, or roll number…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
          <select className="form-select" style={{ width: 170 }} value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
            <option value="">All roles</option><option value="STUDENT">Students</option><option value="WARDEN">Wardens</option><option value="ADMIN">Admins</option>
          </select>
        </div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Student Profile</th><th>Created</th><th>Details</th></tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan={6}><div className="loading-center"><div className="spinner" /></div></td></tr>
                : isError ? <tr><td colSpan={6} className="empty-state">{error?.response?.data?.message || "Could not load users. Please retry."}</td></tr>
                  : users.length ? users.map((user) => <tr key={user.id}>
                    <td><button className="btn btn-secondary btn-sm" onClick={() => setSelectedUser(user)}>{user.name}</button></td>
                    <td>{user.email}</td>
                    <td><span className={`badge ${user.role === "ADMIN" ? "badge-danger" : user.role === "WARDEN" ? "badge-success" : "badge-indigo"}`}>{user.role}</span></td>
                    <td>{user.student ? `${user.student.rollNo} · ${user.student.course}` : "—"}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td><button className="btn btn-secondary btn-sm" onClick={() => setSelectedUser(user)}><Eye size={14} /> View</button></td>
                  </tr>)
                    : <tr><td colSpan={6} className="empty-state">No user accounts found.</td></tr>}
            </tbody>
          </table>
        </div>
        {meta && <div className="pagination"><span className="pagination-info">Showing {users.length} of {meta.total} accounts</span><div className="pagination-controls"><button className="btn btn-secondary btn-sm" disabled={!meta.hasPrevPage} onClick={() => setPage((p) => p - 1)}>Previous</button><span>Page {meta.page} of {Math.max(meta.totalPages, 1)}</span><button className="btn btn-secondary btn-sm" disabled={!meta.hasNextPage} onClick={() => setPage((p) => p + 1)}>Next</button></div></div>}
      </div>

      {selectedUser && <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedUser(null)}><div className="modal">
        <div className="modal-header"><h3 className="modal-title">Account Details</h3><button className="btn btn-icon btn-secondary" onClick={() => setSelectedUser(null)}><X size={18} /></button></div>
        <div className="modal-body">
          <div className="form-group"><span className="form-label">Name</span><div>{selectedUser.name}</div></div>
          <div className="form-group"><span className="form-label">Email</span><div>{selectedUser.email}</div></div>
          <div className="form-group"><span className="form-label">Role</span><div>{selectedUser.role}</div></div>
          <div className="form-group"><span className="form-label">Created</span><div>{new Date(selectedUser.createdAt).toLocaleString()}</div></div>
          {selectedUser.student ? <><div className="form-group"><span className="form-label">Roll Number</span><div>{selectedUser.student.rollNo}</div></div><div className="form-group"><span className="form-label">Course / Year</span><div>{selectedUser.student.course} · Year {selectedUser.student.year}</div></div><div className="form-group"><span className="form-label">Contact / Room</span><div>{selectedUser.student.phone || "No phone"} · {selectedUser.student.room ? `Room ${selectedUser.student.room.roomNo}, Floor ${selectedUser.student.room.floor}` : "Unassigned"}</div></div></> : <p>No student profile is linked to this account.</p>}
        </div>
      </div></div>}

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
