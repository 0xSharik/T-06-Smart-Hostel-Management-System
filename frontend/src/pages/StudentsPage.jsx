/**
 * src/pages/StudentsPage.jsx — Student Roster & Direct Room Allotment
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Plus, Search, Trash2, UserPlus, DoorOpen, X, RefreshCw } from "lucide-react";
import { studentAPI, roomAPI } from "../api";
import toast from "react-hot-toast";

export default function StudentsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage]     = useState(1);
  const [showAddModal, setShowAddModal]       = useState(false);
  const [assignStudentTarget, setAssignStudentTarget] = useState(null); // student being assigned
  const [selectedRoomId, setSelectedRoomId]           = useState("");

  const [form, setForm] = useState({
    userId: "", rollNo: "", course: "", year: 1,
    phone: "", parentName: "", parentPhone: ""
  });

  const { data, isLoading } = useQuery(
    ["students", page, search],
    () => studentAPI.getAll({ page, limit: 10, search }),
    { keepPreviousData: true }
  );

  const { data: availableRoomsRes } = useQuery(
    "all-available-rooms-select",
    () => roomAPI.getAll({ limit: 9999 }),
    { enabled: !!assignStudentTarget }
  );

  const availableRooms = (availableRoomsRes?.data?.data || []).filter(
    r => r.status !== "MAINTENANCE" && r.occupancy < r.capacity
  );

  const deleteMutation = useMutation(studentAPI.delete, {
    onSuccess: () => { qc.invalidateQueries("students"); toast.success("Student profile deleted"); },
    onError: (e) => toast.error(e.response?.data?.message || "Delete failed"),
  });

  const createMutation = useMutation(studentAPI.create, {
    onSuccess: () => { qc.invalidateQueries("students"); setShowAddModal(false); toast.success("Student profile created"); },
    onError: (e) => toast.error(e.response?.data?.message || "Create failed"),
  });

  const assignMutation = useMutation(
    ({ studentId, roomId }) => studentAPI.assignRoom(studentId, roomId),
    {
      onSuccess: () => {
        qc.invalidateQueries("students");
        qc.invalidateQueries("warden-all-rooms");
        toast.success("Room assigned successfully!");
        setAssignStudentTarget(null);
        setSelectedRoomId("");
      },
      onError: (e) => toast.error(e.response?.data?.message || "Assignment failed"),
    }
  );

  const unassignMutation = useMutation(studentAPI.unassignRoom, {
    onSuccess: () => {
      qc.invalidateQueries("students");
      qc.invalidateQueries("warden-all-rooms");
      toast.success("Student unassigned from room");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Unassign failed"),
  });

  const students = data?.data?.data;
  const meta     = data?.data?.meta;

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate({ ...form, year: parseInt(form.year) });
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete student profile for ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!selectedRoomId) return toast.error("Please select a room.");
    assignMutation.mutate({ studentId: assignStudentTarget.id, roomId: selectedRoomId });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Students</h1>
          <p>Manage all hostel student profiles and perform direct room assignments.</p>
        </div>
        <button id="add-student-btn" className="btn btn-primary" onClick={() => setShowAddModal(true)}>
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
                <th>Assigned Room</th>
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
                    <td>
                      {s.room ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span className="badge badge-success">Room {s.room.roomNo}</span>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: "2px 6px", fontSize: "0.7rem" }}
                            title="Unassign Room"
                            onClick={() => {
                              if (window.confirm(`Unassign ${s.user?.name} from Room ${s.room.roomNo}?`)) {
                                unassignMutation.mutate(s.id);
                              }
                            }}
                          >
                            Unassign
                          </button>
                        </div>
                      ) : (
                        <span className="badge badge-warning">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            setAssignStudentTarget(s);
                            setSelectedRoomId(s.room?.id || "");
                          }}
                        >
                          <DoorOpen size={14} /> {s.room ? "Change Room" : "Assign Room"}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(s.id, s.user?.name)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>No students found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
            <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Page {page} of {meta.totalPages}</span>
            <button className="btn btn-secondary btn-sm" disabled={page === meta.totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        )}
      </div>

      {/* ── ASSIGN ROOM MODAL ─────────────────────────────────────────────────── */}
      {assignStudentTarget && (
        <div className="modal-backdrop" onClick={() => setAssignStudentTarget(null)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Room — {assignStudentTarget.user?.name}</h2>
              <button className="modal-close" onClick={() => setAssignStudentTarget(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAssignSubmit} className="modal-body">
              <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                Student: <strong>{assignStudentTarget.user?.name}</strong> (Roll: <code>{assignStudentTarget.rollNo}</code>)
                {assignStudentTarget.room && <div>Currently in: <strong style={{ color: "var(--accent-primary)" }}>Room {assignStudentTarget.room.roomNo}</strong></div>}
              </div>

              <div className="form-group">
                <label className="form-label">Select Destination Room</label>
                <select
                  className="form-select"
                  required
                  value={selectedRoomId}
                  onChange={e => setSelectedRoomId(e.target.value)}
                >
                  <option value="">-- Choose Vacant Room ({availableRooms.length} available) --</option>
                  {availableRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Room {room.roomNo} (Floor {room.floor} · {room.type} · {room.occupancy}/{room.capacity} beds)
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-footer" style={{ marginTop: "1.5rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setAssignStudentTarget(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={assignMutation.isLoading}>
                  {assignMutation.isLoading ? "Assigning..." : "Confirm Room Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD STUDENT MODAL ─────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Student Profile</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="modal-body">
              <div className="form-group">
                <label className="form-label">User ID (cuid)</label>
                <input className="form-input" placeholder="Paste existing User ID..." required value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input className="form-input" placeholder="ST2024..." required value={form.rollNo} onChange={e => setForm(f => ({ ...f, rollNo: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Course</label>
                  <input className="form-input" placeholder="B.Tech CSE" required value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <select className="form-select" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}>
                    {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" placeholder="9876543210" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createMutation.isLoading}>Create Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
