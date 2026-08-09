/**
 * src/pages/StudentsPage.jsx
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Plus, Search, Trash2, Eye, X, UserPlus } from "lucide-react";
import { studentAPI } from "../api";
import toast from "react-hot-toast";

const ROLE_COLORS = { 1: "indigo", 2: "violet", 3: "emerald", 4: "amber" };

export default function StudentsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ userId: "", rollNo: "", course: "", year: 1, phone: "", parentName: "", parentPhone: "" });

  const { data, isLoading } = useQuery(
    ["students", page, search],
    () => studentAPI.getAll({ page, limit: 10, search }),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(studentAPI.delete, {
    onSuccess: () => { qc.invalidateQueries("students"); toast.success("Student deleted"); },
    onError: (e) => toast.error(e.response?.data?.message || "Delete failed"),
  });

  const createMutation = useMutation(studentAPI.create, {
    onSuccess: () => { qc.invalidateQueries("students"); setShowModal(false); toast.success("Student profile created"); },
    onError: (e) => toast.error(e.response?.data?.message || "Create failed"),
  });

  const students = data?.data?.data;
  const meta = data?.data?.meta;

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate({ ...form, year: parseInt(form.year) });
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete student profile for ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Students</h1>
          <p>Manage all hostel student profiles and room assignments.</p>
        </div>
        <button id="add-student-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Student
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-bar">
          <Search size={16} />
          <input
            id="student-search"
            className="form-input search-input"
            style={{ minWidth: 280 }}
            placeholder="Search by name, email, or roll no..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No</th>
                <th>Course</th>
                <th>Year</th>
                <th>Phone</th>
                <th>Room</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7}><div className="loading-center"><div className="spinner" /></div></td></tr>
              ) : students?.length > 0 ? (
                students.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: "50%",
                          background: "var(--gradient-brand)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700, fontSize: "0.8125rem", color: "white", flexShrink: 0
                        }}>
                          {s.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>{s.user?.name}</div>
                          <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{s.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><code style={{ background: "rgba(99,102,241,0.1)", padding: "2px 8px", borderRadius: 4, fontSize: "0.8125rem", color: "var(--accent-primary)" }}>{s.rollNo}</code></td>
                    <td>{s.course}</td>
                    <td><span className="badge badge-secondary">Year {s.year}</span></td>
                    <td>{s.phone}</td>
                    <td>{s.room ? <span className="badge badge-success">Room {s.room.roomNo}</span> : <span className="badge badge-secondary">Unassigned</span>}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className="btn btn-icon btn-secondary btn-sm" title="Delete" onClick={() => handleDelete(s.id, s.user?.name)}>
                          <Trash2 size={14} color="var(--accent-danger)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <UserPlus size={40} />
                    <h3>No students found</h3>
                    <p>Add student profiles to get started.</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && (
          <div className="pagination">
            <span className="pagination-info">
              Showing {students?.length || 0} of {meta.total} students
            </span>
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
              <h3 className="modal-title">Add Student Profile</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">User ID (of existing Student user)</label>
                <input id="student-userId" className="form-input" placeholder="User ID" required value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input id="student-rollNo" className="form-input" placeholder="CS2024001" required value={form.rollNo} onChange={e => setForm(f => ({ ...f, rollNo: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <select id="student-year" className="form-select" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}>
                    {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Course</label>
                <input id="student-course" className="form-input" placeholder="B.Tech CSE" required value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input id="student-phone" className="form-input" placeholder="9876543210" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Parent Name</label>
                  <input className="form-input" placeholder="Parent/Guardian" value={form.parentName} onChange={e => setForm(f => ({ ...f, parentName: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Parent Phone</label>
                  <input className="form-input" placeholder="9876543000" value={form.parentPhone} onChange={e => setForm(f => ({ ...f, parentPhone: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="student-create-submit" type="submit" className="btn btn-primary" disabled={createMutation.isLoading}>
                  {createMutation.isLoading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : "Create Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
