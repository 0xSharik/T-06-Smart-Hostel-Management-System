/**
 * src/pages/warden/WardenRooms.jsx — Warden Room Management & Occupancy Heatmap
 * Interactive Heatmap: Click on any room to view occupants, student profiles, and assign/unassign.
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  DoorOpen, Users, ShieldAlert, CheckCircle2, RefreshCw, X,
  User, Phone, UserMinus, UserPlus, Sparkles, AlertTriangle, Shield,
} from "lucide-react";
import { roomAPI, studentAPI } from "../../api";
import toast from "react-hot-toast";

const TYPE_LABELS = {
  SINGLE: "1",
  DOUBLE: "2",
  TRIPLE: "3",
  QUAD:   "4",
  QUINT:  "5",
};

const TYPE_BADGE_COLORS = {
  SINGLE: "rgba(99,102,241,0.25)",
  DOUBLE: "rgba(59,130,246,0.25)",
  TRIPLE: "rgba(16,185,129,0.25)",
  QUAD:   "rgba(245,158,11,0.25)",
  QUINT:  "rgba(239,68,68,0.25)",
};

export default function WardenRooms() {
  const qc = useQueryClient();
  const [activeFloor, setActiveFloor] = useState("ALL");
  const [activeType, setActiveType]   = useState("ALL");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedStudentToAssign, setSelectedStudentToAssign] = useState("");

  const { data: roomsRes, isLoading, refetch } = useQuery(
    "warden-all-rooms",
    () => roomAPI.getAll({ limit: 9999 }),
    { refetchOnWindowFocus: false }
  );

  const { data: unassignedRes } = useQuery(
    "unassigned-students-list",
    () => studentAPI.getAll({ limit: 9999 }),
    { enabled: !!selectedRoom }
  );

  const rooms = roomsRes?.data?.data || [];
  const allStudents = unassignedRes?.data?.data || [];
  const unassignedStudents = allStudents.filter(s => !s.room);

  // Keep active selectedRoom state updated when queries refetch
  const liveSelectedRoom = selectedRoom
    ? rooms.find(r => r.id === selectedRoom.id) || selectedRoom
    : null;

  const assignMutation = useMutation(
    ({ studentId, roomId }) => studentAPI.assignRoom(studentId, roomId),
    {
      onSuccess: () => {
        toast.success("Student assigned to room successfully!");
        qc.invalidateQueries("warden-all-rooms");
        qc.invalidateQueries("unassigned-students-list");
        setSelectedStudentToAssign("");
      },
      onError: (e) => toast.error(e.response?.data?.message || "Failed to assign room."),
    }
  );

  const unassignMutation = useMutation(
    (studentId) => studentAPI.unassignRoom(studentId),
    {
      onSuccess: () => {
        toast.success("Student unassigned from room.");
        qc.invalidateQueries("warden-all-rooms");
        qc.invalidateQueries("unassigned-students-list");
      },
      onError: (e) => toast.error(e.response?.data?.message || "Failed to unassign student."),
    }
  );

  const filteredRooms = rooms.filter((r) => {
    const floorMatch = activeFloor === "ALL" || r.floor === parseInt(activeFloor);
    const typeMatch  = activeType === "ALL"  || r.type === activeType;
    return floorMatch && typeMatch;
  });

  const getHeatmapClass = (room) => {
    if (room.status === "MAINTENANCE") return "maintenance";
    if (room.occupancy >= room.capacity) return "full";
    if (room.occupancy > 0) return "occupied";
    return "available";
  };

  const liveCounts = rooms.reduce(
    (acc, r) => {
      const cls = getHeatmapClass(r);
      acc[cls] = (acc[cls] || 0) + 1;
      return acc;
    },
    { available: 0, occupied: 0, full: 0, maintenance: 0 }
  );

  const typeBreakdown = rooms.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});

  const floors    = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const roomTypes = ["SINGLE", "DOUBLE", "TRIPLE", "QUAD", "QUINT"];

  const handleAssign = (e) => {
    e.preventDefault();
    if (!selectedStudentToAssign) return toast.error("Please select a student to assign.");
    assignMutation.mutate({ studentId: selectedStudentToAssign, roomId: liveSelectedRoom.id });
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Room Management &amp; Occupancy Heatmap</h1>
          <p>Click on any room block to inspect occupants or assign/unassign students.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => refetch()}>
          <RefreshCw size={16} /> Refresh Map
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid-4" style={{ marginBottom: "var(--space-xl)" }}>
        <div className="stat-card">
          <div className="stat-icon blue"><DoorOpen size={22} /></div>
          <div className="stat-info">
            <div className="stat-value">{rooms.length || "—"}</div>
            <div className="stat-label">Total Rooms</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon emerald"><CheckCircle2 size={22} /></div>
          <div className="stat-info">
            <div className="stat-value">{liveCounts.available}</div>
            <div className="stat-label">Available Rooms</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><Users size={22} /></div>
          <div className="stat-info">
            <div className="stat-value">{liveCounts.occupied + liveCounts.full}</div>
            <div className="stat-label">Occupied Rooms</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><ShieldAlert size={22} /></div>
          <div className="stat-info">
            <div className="stat-value">{liveCounts.maintenance}</div>
            <div className="stat-label">Under Maintenance</div>
          </div>
        </div>
      </div>

      {/* Room Type Bar */}
      <div className="heatmap-type-strip">
        {roomTypes.map((type) => (
          <div key={type} className="heatmap-type-badge" style={{ background: TYPE_BADGE_COLORS[type] }}>
            <span className="heatmap-type-label">{type}</span>
            <span className="heatmap-type-count">{typeBreakdown[type] || 0} rooms</span>
            <span className="heatmap-type-beds">{type === "SINGLE" ? 1 : type === "DOUBLE" ? 2 : type === "TRIPLE" ? 3 : type === "QUAD" ? 4 : 5}-seater</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="heatmap-filters">
        <div className="heatmap-filter-group">
          <span className="heatmap-filter-label">Floor:</span>
          <div className="tabs" style={{ marginBottom: 0, border: "none" }}>
            <button className={`tab-btn ${activeFloor === "ALL" ? "active" : ""}`} onClick={() => setActiveFloor("ALL")}>All Floors</button>
            {floors.map((f) => (
              <button key={f} className={`tab-btn ${activeFloor === String(f) ? "active" : ""}`} onClick={() => setActiveFloor(String(f))}>
                Floor {f}
              </button>
            ))}
          </div>
        </div>
        <div className="heatmap-filter-group">
          <span className="heatmap-filter-label">Type:</span>
          <div className="tabs" style={{ marginBottom: 0, border: "none" }}>
            <button className={`tab-btn ${activeType === "ALL" ? "active" : ""}`} onClick={() => setActiveType("ALL")}>All Types</button>
            {roomTypes.map((t) => (
              <button key={t} className={`tab-btn ${activeType === t ? "active" : ""}`} onClick={() => setActiveType(t)}>
                {t[0] + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="heatmap-legend">
        <div className="heatmap-legend-item">
          <div className="heatmap-legend-dot available" /> Available
        </div>
        <div className="heatmap-legend-item">
          <div className="heatmap-legend-dot occupied" /> Partially Occupied
        </div>
        <div className="heatmap-legend-item">
          <div className="heatmap-legend-dot full" /> Full
        </div>
        <div className="heatmap-legend-item">
          <div className="heatmap-legend-dot maintenance" /> Under Maintenance
        </div>
        <span className="heatmap-legend-note">
          👉 <strong>Click any room</strong> to inspect student details &amp; manage assignments.
        </span>
      </div>

      {/* Heatmap Grid */}
      <div className="card" style={{ padding: "1.25rem" }}>
        {isLoading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filteredRooms.length > 0 ? (
          <div className="heatmap-grid">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className={`heatmap-cell ${getHeatmapClass(room)}`}
                onClick={() => setSelectedRoom(room)}
                title={`Click to view details of Room ${room.roomNo}`}
              >
                <div className="heatmap-cell-badge" style={{ background: TYPE_BADGE_COLORS[room.type] }}>
                  {TYPE_LABELS[room.type]}
                </div>
                <div className="heatmap-cell-roomno">{room.roomNo}</div>
                <div className="heatmap-cell-occ">{room.occupancy}/{room.capacity}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <DoorOpen size={40} />
            <h3>No rooms found for selected filter</h3>
          </div>
        )}
      </div>

      {/* ── ROOM DETAILS & OCCUPANTS MODAL ─────────────────────────────────────── */}
      {liveSelectedRoom && (
        <div className="modal-backdrop" onClick={() => setSelectedRoom(null)}>
          <div className="modal" style={{ maxWidth: 640, width: "90%" }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{
                  width: 42, height: 42, borderRadius: "var(--radius-md)",
                  background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 800, fontSize: "1.125rem"
                }}>
                  {liveSelectedRoom.roomNo}
                </div>
                <div>
                  <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Room {liveSelectedRoom.roomNo} Details</h2>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
                    Floor {liveSelectedRoom.floor} · {liveSelectedRoom.type} ({liveSelectedRoom.capacity}-seater)
                  </p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelectedRoom(null)}><X size={20} /></button>
            </div>

            <div className="modal-body" style={{ padding: "1.5rem" }}>
              {/* Room Stats Strip */}
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem",
                marginBottom: "1.5rem", padding: "1rem", borderRadius: "var(--radius-md)",
                background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)",
              }}>
                <div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Status</div>
                  <div style={{ marginTop: 2 }}>
                    <span className={`badge ${
                      liveSelectedRoom.status === "MAINTENANCE" ? "badge-danger" :
                      liveSelectedRoom.status === "FULL" ? "badge-warning" :
                      liveSelectedRoom.status === "OCCUPIED" ? "badge-indigo" : "badge-success"
                    }`}>
                      {liveSelectedRoom.status}
                    </span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Beds Occupied</div>
                  <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--text-primary)" }}>
                    {liveSelectedRoom.occupancy} / {liveSelectedRoom.capacity}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Vacant Beds</div>
                  <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--accent-success)" }}>
                    {Math.max(0, liveSelectedRoom.capacity - liveSelectedRoom.occupancy)}
                  </div>
                </div>
              </div>

              {/* Occupants List */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: 6 }}>
                  <Users size={16} color="var(--accent-primary)" /> Room Occupants ({liveSelectedRoom.students?.length || 0})
                </h3>

                {liveSelectedRoom.students && liveSelectedRoom.students.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    {liveSelectedRoom.students.map((student) => (
                      <div key={student.id} style={{
                        padding: "0.875rem 1rem", borderRadius: "var(--radius-md)",
                        background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
                        display: "flex", alignItems: "center", justifyContent: "space-between"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div className="user-avatar" style={{ width: 38, height: 38, fontSize: "0.875rem" }}>
                            {student.user?.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.875rem" }}>
                              {student.user?.name}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              Roll: <code style={{ color: "var(--accent-primary)" }}>{student.rollNo}</code> · {student.course} (Yr {student.year})
                            </div>
                            {student.phone && (
                              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                                <Phone size={10} /> {student.phone}
                                {student.parentPhone && ` · Parent: ${student.parentPhone}`}
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ color: "var(--accent-danger)", borderColor: "rgba(239,68,68,0.2)" }}
                          disabled={unassignMutation.isLoading}
                          onClick={() => {
                            if (window.confirm(`Unassign ${student.user?.name} from Room ${liveSelectedRoom.roomNo}?`)) {
                              unassignMutation.mutate(student.id);
                            }
                          }}
                        >
                          <UserMinus size={14} /> Unassign
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: "center", padding: "2rem",
                    background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-md)",
                    border: "1px dashed var(--border-subtle)", color: "var(--text-muted)", fontSize: "0.875rem"
                  }}>
                    No students currently assigned to this room.
                  </div>
                )}
              </div>

              {/* Quick Assign Form (if room has vacant beds and not maintenance) */}
              {liveSelectedRoom.status !== "MAINTENANCE" && liveSelectedRoom.occupancy < liveSelectedRoom.capacity ? (
                <form onSubmit={handleAssign} style={{
                  padding: "1rem", borderRadius: "var(--radius-md)",
                  background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.2)"
                }}>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--accent-primary)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: 6 }}>
                    <UserPlus size={15} /> Assign Student to Room {liveSelectedRoom.roomNo}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <select
                      className="form-select"
                      style={{ flex: 1, fontSize: "0.8125rem" }}
                      value={selectedStudentToAssign}
                      onChange={e => setSelectedStudentToAssign(e.target.value)}
                    >
                      <option value="">-- Select Unassigned Student ({unassignedStudents.length} available) --</option>
                      {unassignedStudents.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.user?.name} ({s.rollNo} · {s.course})
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={assignMutation.isLoading || !selectedStudentToAssign}
                    >
                      <UserPlus size={14} /> Assign Bed
                    </button>
                  </div>
                </form>
              ) : liveSelectedRoom.status === "MAINTENANCE" ? (
                <div style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertTriangle size={16} /> Room is under maintenance and cannot accept new student assignments.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
