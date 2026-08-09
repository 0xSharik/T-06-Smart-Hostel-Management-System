/**
 * src/pages/student/MyRoom.jsx — Student's Room Details Page
 */

import { useQuery } from "react-query";
import { DoorOpen, Users, Wifi, CheckCircle2, Shield, Layers } from "lucide-react";
import useAuthStore from "../../store/authStore";
import { roomAPI } from "../../api";

export default function MyRoom() {
  const { user } = useAuthStore();
  const roomId = user?.student?.roomId;

  const { data: roomRes, isLoading } = useQuery(
    ["my-room-details", roomId],
    () => roomAPI.getById(roomId),
    { enabled: !!roomId }
  );

  const room = roomRes?.data?.data;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div className="page-header">
        <div>
          <h1>My Room</h1>
          <p>View your room assignment details, amenities, and roommates.</p>
        </div>
      </div>

      {!roomId ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <DoorOpen size={48} color="var(--accent-warning)" style={{ marginBottom: "1rem" }} />
          <h3>No Room Assigned Yet</h3>
          <p style={{ maxWidth: 400, margin: "0.5rem auto 1.5rem" }}>
            You do not currently have an assigned hostel room. Please contact your hostel warden for allotment.
          </p>
        </div>
      ) : isLoading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : room ? (
        <div className="grid-2">
          {/* Room Details Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <DoorOpen size={20} color="var(--accent-primary)" /> Room Details
              </h3>
              <span className={`badge ${room.status === "AVAILABLE" ? "badge-success" : room.status === "OCCUPIED" ? "badge-warning" : "badge-indigo"}`}>
                {room.status}
              </span>
            </div>

            <div className="info-block">
              <div className="info-row">
                <span className="info-label">Room Number</span>
                <span className="info-value" style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-primary)" }}>{room.roomNo}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Floor</span>
                <span className="info-value">Floor {room.floor}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Room Type</span>
                <span className="info-value">{room.type} ({room.capacity} Sharing)</span>
              </div>
              <div className="info-row">
                <span className="info-label">Current Occupancy</span>
                <span className="info-value">{room.occupancy} / {room.capacity} beds occupied</span>
              </div>
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                Amenities Provided
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {room.amenities && room.amenities.length > 0 ? (
                  room.amenities.map((item, idx) => (
                    <span key={idx} className="badge badge-secondary" style={{ padding: "0.375rem 0.75rem", fontSize: "0.8125rem" }}>
                      <CheckCircle2 size={14} color="var(--accent-success)" /> {item}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontStyle: "italic" }}>Standard bed, desk, wardrobe</span>
                )}
              </div>
            </div>
          </div>

          {/* Roommates Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Users size={20} color="var(--accent-secondary)" /> Roommates
              </h3>
            </div>

            {room.students && room.students.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {room.students.map((st) => (
                  <div key={st.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "var(--bg-input)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--gradient-brand)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", flexShrink: 0 }}>
                      {st.user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                        {st.user?.name} {st.user?.email === user?.email && <span className="badge badge-indigo" style={{ marginLeft: 6 }}>You</span>}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {st.course} — Year {st.year} | Roll: {st.rollNo}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No other roommates assigned to this room.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
