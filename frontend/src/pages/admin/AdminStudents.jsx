/**
 * src/pages/admin/AdminStudents.jsx — Student Management & Room Allotment Engine
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Users, DoorOpen, Sparkles, CheckCircle2, Search, ArrowRight, UserPlus } from "lucide-react";
import { studentAPI, roomAPI } from "../../api";
import toast from "react-hot-toast";

export default function AdminStudents() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("list"); // "list" | "allotment"
  const [search, setSearch] = useState("");

  // Allotment Engine Form
  const [prefForm, setPrefForm] = useState({ preferredFloor: "1", preferredType: "SINGLE", course: "B.Tech CSE", year: 1 });
  const [rankedRooms, setRankedRooms] = useState([]);

  const { data: studentRes, isLoading } = useQuery(["admin-students-list", search], () => studentAPI.getAll({ limit: 20, search }));

  const students = studentRes?.data?.data || [];
  const unassignedStudents = students.filter((student) => !student.room);
  const selectedStudent = students.find((student) => student.id === prefForm.studentId) || unassignedStudents[0] || students[0];

  const allotmentMutation = useMutation(roomAPI.runAllotment, {
    onSuccess: (res) => {
      const recommendations = res.data?.data?.topRecommendations || [];
      setRankedRooms(recommendations.map((item) => ({ ...item.room, score: item.score, matchPercentage: item.matchPercentage, remainingBeds: item.remainingBeds })));
      toast.success("Allotment engine calculated optimal room ranks!");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Allotment engine failed"),
  });

  const assignMutation = useMutation(({ studentId, roomId }) => studentAPI.assignRoom(studentId, roomId), {
    onSuccess: (_, variables) => {
      toast.success(`Assigned to Room ${rankedRooms.find((room) => room.id === variables.roomId)?.roomNo || ""}!`);
      setRankedRooms([]);
      qc.invalidateQueries("admin-students-list");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Room assignment failed"),
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
          <h1>Student Management & Room Allotment Engine</h1>
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
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6}><div className="loading-center"><div className="spinner" /></div></td></tr>
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
                          <span className="badge badge-success">Room {s.room.roomNo}</span>
                        ) : (
                          <span className="badge badge-warning">Unassigned</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6}><div className="empty-state"><h3>No students found</h3></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "allotment" && (
        <div className="grid-2">
          {/* Preferences Input */}
          <div className="card">
            <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={20} color="var(--accent-secondary)" /> Allotment Preference Input
            </h3>
            <form onSubmit={handleRunAllotmentEngine}>
              <div className="form-group">
                <label className="form-label">Preferred Floor</label>
                <select className="form-select" value={prefForm.preferredFloor} onChange={e => setPrefForm(f => ({ ...f, preferredFloor: e.target.value }))}>
                  {[1, 2, 3, 4, 5].map(f => <option key={f} value={f}>Floor {f}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Room Type</label>
                <select className="form-select" value={prefForm.preferredType} onChange={e => setPrefForm(f => ({ ...f, preferredType: e.target.value }))}>
                  <option value="SINGLE">SINGLE</option>
                  <option value="DOUBLE">DOUBLE</option>
                  <option value="TRIPLE">TRIPLE</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Student</label>
                <select className="form-select" value={prefForm.studentId || selectedStudent?.id || ""} onChange={e => setPrefForm(f => ({ ...f, studentId: e.target.value }))}>
                  {[...unassignedStudents, ...students.filter((student) => student.room)].map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.user?.name || student.rollNo} ({student.rollNo}){student.room ? ` - Room ${student.room.roomNo}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} disabled={allotmentMutation.isLoading}>
                {allotmentMutation.isLoading ? "Calculating..." : "Run Allotment Matching Algorithm"}
              </button>
            </form>
          </div>

          {/* Ranked Results */}
          <div className="card">
            <h3 style={{ marginBottom: "1rem" }}>Ranked Room Recommendations</h3>
            {rankedRooms.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {rankedRooms.map((room, idx) => (
                  <div key={room.id} style={{ padding: "1rem", background: "var(--bg-input)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--accent-primary)", fontSize: "1.125rem" }}>
                        #{idx + 1} Recommendation: Room {room.roomNo}
                      </div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                        Floor {room.floor} | {room.type} | Available Beds: {room.capacity - room.occupancy}
                        {room.matchPercentage != null ? ` | Match: ${room.matchPercentage}%` : ""}
                      </div>
                    </div>
                    <button className="btn btn-success btn-sm" onClick={() => assignMutation.mutate({ studentId: prefForm.studentId || selectedStudent?.id, roomId: room.id })} disabled={assignMutation.isLoading}>
                      Assign Room
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>
                Enter student preferences and click Run to calculate algorithm scores.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
