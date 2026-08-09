/**
 * src/pages/admin/AdminStudents.jsx — Student Management & Room Allotment Engine
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Users, DoorOpen, Sparkles, CheckCircle2, Search, ArrowRight, UserPlus, X } from "lucide-react";
import { studentAPI, roomAPI } from "../../api";
import toast from "react-hot-toast";

export default function AdminStudents() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("list");
  const [search, setSearch]       = useState("");

  const [assignTarget, setAssignTarget] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState("");

  // Allotment Engine Form
  const [prefForm, setPrefForm] = useState({ preferredFloor: "1", preferredType: "SINGLE", course: "B.Tech CSE", year: 1 });
  const [rankedRooms, setRankedRooms] = useState([]);

  const { data: studentRes, isLoading } = useQuery(["admin-students-list", search], () => studentAPI.getAll({ limit: 50, search }));
  const { data: availableRoomsRes }     = useQuery("admin-available-rooms", () => roomAPI.getAll({ limit: 9999 }), { enabled: !!assignTarget });

  const students = studentRes?.data?.data || [];
  const availableRooms = (availableRoomsRes?.data?.data || []).filter(r => r.status !== "MAINTENANCE" && r.occupancy < r.capacity);

  const unassignedStudents = students.filter((student) => !student.room);
  const selectedStudent    = students.find((student) => student.id === prefForm.studentId) || unassignedStudents[0] || students[0];

  const allotmentMutation = useMutation(roomAPI.runAllotment, {
    onSuccess: (res) => {
      const recommendations = res.data?.data?.topRecommendations || [];
      setRankedRooms(recommendations.map((item) => ({ ...item.room, score: item.score, matchPercentage: item.matchPercentage, remainingBeds: item.remainingBeds })));
      toast.success("Allotment engine calculated optimal room ranks!");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Allotment engine failed"),
  });

  const assignMutation = useMutation(({ studentId, roomId }) => studentAPI.assignRoom(studentId, roomId), {
    onSuccess: () => {
      toast.success(`Room assigned successfully!`);
      setRankedRooms([]);
      setAssignTarget(null);
      qc.invalidateQueries("admin-students-list");
      qc.invalidateQueries("admin-available-rooms");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Room assignment failed"),
  });

  const unassignMutation = useMutation(studentAPI.unassignRoom, {
    onSuccess: () => {
      toast.success("Student unassigned from room");
      qc.invalidateQueries("admin-students-list");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Unassign failed"),
  });

  const handleRunAllotmentEngine = (e) => {
    e.preventDefault();
    const studentId = prefForm.studentId || selectedStudent?.id;
    if (!studentId) return toast.error("Select a student before running allotment");
    allotmentMutation.mutate({ ...prefForm, studentId });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Student Management &amp; Room Allotment Engine</h1>
          <p>Manage student records or run the automated preference-matching allotment algorithm.</p>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${activeTab === "list" ? "active" : ""}`} onClick={() => setActiveTab("list")}>
          <Users size={16} style={{ display: "inline", marginRight: 6 }} /> Student Directory
        </button>
        <button className={`tab-btn ${activeTab === "allotment" ? "active" : ""}`} onClick={() => setActiveTab("allotment")}>
          <Sparkles size={16} style={{ display: "inline", marginRight: 6 }} /> Allotment Engine
        </button>
      </div>

      {activeTab === "list" && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: "1rem" }}>
            <div className="search-bar" style={{ flex: 1, maxWidth: 360 }}>
              <Search size={16} />
              <input
                className="form-input search-input"
                placeholder="Search students by name, roll no, email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

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
                ) : students.length > 0 ? (
                  students.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{s.user?.name}</td>
                      <td><code>{s.rollNo}</code></td>
                      <td>{s.course}</td>
                      <td>Year {s.year}</td>
                      <td>{s.phone}</td>
                      <td>
                        {s.room ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span className="badge badge-success">Room {s.room.roomNo}</span>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: "2px 6px", fontSize: "0.7rem" }}
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
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            setAssignTarget(s);
                            setSelectedRoomId(s.room?.id || "");
                          }}
                        >
                          <DoorOpen size={14} /> {s.room ? "Change Room" : "Assign Room"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>No students found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "allotment" && (
        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Sparkles size={18} color="var(--accent-primary)" /> Preference Allotment Engine
              </h3>
            </div>
            <form onSubmit={handleRunAllotmentEngine}>
              <div className="form-group">
                <label className="form-label">Target Unassigned Student</label>
                <select
                  className="form-select"
                  value={prefForm.studentId || selectedStudent?.id || ""}
                  onChange={e => setPrefForm(f => ({ ...f, studentId: e.target.value }))}
                >
                  {unassignedStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.user?.name} ({s.rollNo} · {s.course})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Preferred Floor</label>
                  <select className="form-select" value={prefForm.preferredFloor} onChange={e => setPrefForm(f => ({ ...f, preferredFloor: e.target.value }))}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(f => <option key={f} value={f}>Floor {f}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Room Type</label>
                  <select className="form-select" value={prefForm.preferredType} onChange={e => setPrefForm(f => ({ ...f, preferredType: e.target.value }))}>
                    {["SINGLE", "DOUBLE", "TRIPLE", "QUAD", "QUINT"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={allotmentMutation.isLoading}>
                {allotmentMutation.isLoading ? "Calculating Optimal Ranks..." : "Run Recommendation Algorithm"}
              </button>
            </form>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Top Ranked Matches</h3>
            </div>
            {rankedRooms.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {rankedRooms.map(room => (
                  <div key={room.id} style={{ padding: "1rem", borderRadius: "var(--radius-md)", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>Room {room.roomNo} · Floor {room.floor}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{room.type} · Match Score: <strong style={{ color: "var(--accent-success)" }}>{room.matchPercentage}%</strong> ({room.remainingBeds} beds available)</div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => assignMutation.mutate({ studentId: prefForm.studentId || selectedStudent?.id, roomId: room.id })}>
                      Assign This Room
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                Run the recommendation algorithm to view top matched rooms.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Direct Assign Modal */}
      {assignTarget && (
        <div className="modal-backdrop" onClick={() => setAssignTarget(null)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Room — {assignTarget.user?.name}</h2>
              <button className="modal-close" onClick={() => setAssignTarget(null)}><X size={20} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if (selectedRoomId) assignMutation.mutate({ studentId: assignTarget.id, roomId: selectedRoomId }); }} className="modal-body">
              <div className="form-group">
                <label className="form-label">Select Vacant Room</label>
                <select className="form-select" required value={selectedRoomId} onChange={e => setSelectedRoomId(e.target.value)}>
                  <option value="">-- Choose Vacant Room --</option>
                  {availableRooms.map(r => (
                    <option key={r.id} value={r.id}>
                      Room {r.roomNo} (Floor {r.floor} · {r.type} · {r.occupancy}/{r.capacity} beds)
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setAssignTarget(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={assignMutation.isLoading}>Confirm Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
