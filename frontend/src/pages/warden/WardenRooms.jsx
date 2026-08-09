/**
 * src/pages/warden/WardenRooms.jsx — Warden Room Management & Occupancy Heatmap
 */

import { useState } from "react";
import { useQuery } from "react-query";
import { DoorOpen, Layers, Users, ShieldAlert, CheckCircle2, RefreshCw } from "lucide-react";
import { roomAPI } from "../../api";

export default function WardenRooms() {
  const [activeFloor, setActiveFloor] = useState("ALL");
  const { data: roomsRes, isLoading, refetch } = useQuery("warden-all-rooms", () => roomAPI.getAll({ limit: 200 }));
  const { data: statsRes } = useQuery("warden-room-stats", roomAPI.getStats);

  const rooms = roomsRes?.data?.data || [];
  const stats = statsRes?.data?.data || {};

  const filteredRooms = activeFloor === "ALL"
    ? rooms
    : rooms.filter(r => r.floor === parseInt(activeFloor));

  const getHeatmapClass = (room) => {
    if (room.status === "MAINTENANCE") return "maintenance";
    if (room.occupancy >= room.capacity) return "full";
    if (room.occupancy > 0) return "occupied";
    return "available";
  };

  // Compute live counts from actual room data (matches the heatmap exactly)
  const liveCounts = rooms.reduce(
    (acc, r) => {
      const cls = getHeatmapClass(r);
      acc[cls] = (acc[cls] || 0) + 1;
      return acc;
    },
    { available: 0, occupied: 0, full: 0, maintenance: 0 }
  );
  const liveAvailable = liveCounts.available;
  const liveOccupied = liveCounts.occupied + liveCounts.full; // partially + fully occupied
  const liveFull = liveCounts.full;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Room Management & Occupancy Heatmap</h1>
          <p>Real-time visual map of all hostel floors, room occupancies, and maintenance statuses.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => refetch()}>
          <RefreshCw size={16} /> Refresh Map
        </button>
      </div>

      {/* Stats row */}
      <div className="grid-4" style={{ marginBottom: "var(--space-xl)" }}>
        <div className="stat-card">
          <div className="stat-icon blue"><DoorOpen size={22} /></div>
          <div className="stat-info">
            <div className="stat-value">{rooms.length || stats.total || "—"}</div>
            <div className="stat-label">Total Rooms</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon emerald"><CheckCircle2 size={22} /></div>
          <div className="stat-info">
            <div className="stat-value">{rooms.length > 0 ? liveAvailable : (stats.available ?? "—")}</div>
            <div className="stat-label">Available Rooms</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><Users size={22} /></div>
          <div className="stat-info">
            <div className="stat-value">{rooms.length > 0 ? liveOccupied : ((stats.occupied ?? 0) + (stats.full ?? 0))}</div>
            <div className="stat-label">Occupied Rooms</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><ShieldAlert size={22} /></div>
          <div className="stat-info">
            <div className="stat-value">{rooms.length > 0 ? liveCounts.maintenance : (stats.maintenance ?? 0)}</div>
            <div className="stat-label">Under Maintenance</div>
          </div>
        </div>
      </div>

      {/* Floor Filter Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${activeFloor === "ALL" ? "active" : ""}`} onClick={() => setActiveFloor("ALL")}>All Floors</button>
        {[1, 2, 3, 4, 5].map(f => (
          <button key={f} className={`tab-btn ${activeFloor === String(f) ? "active" : ""}`} onClick={() => setActiveFloor(String(f))}>
            Floor {f}
          </button>
        ))}
      </div>

      {/* Heatmap Legend */}
      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem", flexWrap: "wrap", fontSize: "0.8125rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(16,185,129,0.3)", border: "1px solid #10b981" }} /> Available
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(245,158,11,0.3)", border: "1px solid #f59e0b" }} /> Partially Occupied
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(239,68,68,0.3)", border: "1px solid #ef4444" }} /> Full
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(148,163,184,0.3)", border: "1px solid #94a3b8" }} /> Under Maintenance
        </div>
      </div>

      {/* Interactive Heatmap Grid */}
      <div className="card">
        {isLoading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filteredRooms.length > 0 ? (
          <div className="heatmap-grid">
            {filteredRooms.map(room => (
              <div
                key={room.id}
                className={`heatmap-cell ${getHeatmapClass(room)}`}
                title={`Room ${room.roomNo} (Floor ${room.floor}): ${room.occupancy}/${room.capacity} beds — ${room.status}`}
              >
                <div style={{ fontSize: "0.875rem", fontWeight: 700 }}>{room.roomNo}</div>
                <div style={{ fontSize: "0.6875rem", opacity: 0.8 }}>{room.occupancy}/{room.capacity}</div>
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
    </div>
  );
}
