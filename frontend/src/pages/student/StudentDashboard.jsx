/**
 * src/pages/student/StudentDashboard.jsx — Personalized Student Portal Dashboard
 */

import { useQuery } from "react-query";
import { DoorOpen, Wrench, UtensilsCrossed, CalendarDays, Bell, User, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import useAuthStore from "../../store/authStore";
import { maintenanceAPI, messAPI, holidayAPI, notificationAPI } from "../../api";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const student = user?.student;

  const { data: maintRes } = useQuery("my-maintenance-dash", () => maintenanceAPI.getAll({ limit: 5 }));
  const { data: menuRes } = useQuery("mess-menu-dash", messAPI.getWeeklyMenu);
  const { data: holidayRes } = useQuery("upcoming-holidays-dash", () => holidayAPI.getUpcoming(3));
  const { data: notifRes } = useQuery("my-notifs-dash", () => notificationAPI.getMyNotifications({ limit: 5 }));

  const myRequests = maintRes?.data?.data || [];
  const upcomingHolidays = holidayRes?.data?.data || [];
  const notifications = notifRes?.data?.data || [];
  const unreadCount = notifRes?.data?.unreadCount || 0;

  const todayName = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][new Date().getDay()];
  const todayMenu = menuRes?.data?.data?.[todayName] || {};

  return (
    <div>
      {/* Welcome Banner */}
      <div className="card" style={{ marginBottom: "var(--space-xl)", background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 100%)", borderColor: "var(--border-color)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>Welcome back, {user?.name}! 👋</h1>
            <p style={{ color: "var(--text-secondary)" }}>
              {student ? `${student.course} — Year ${student.year} | Roll No: ${student.rollNo}` : "Student Profile"}
            </p>
          </div>
          {student?.room ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "var(--bg-card)", padding: "0.75rem 1.25rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
              <DoorOpen size={24} color="var(--accent-primary)" />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Assigned Room</div>
                <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)" }}>Room {student.room.roomNo} <span style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--text-muted)" }}>(Floor {student.room.floor})</span></div>
              </div>
            </div>
          ) : (
            <div style={{ background: "rgba(245,158,11,0.1)", padding: "0.75rem 1.25rem", borderRadius: "var(--radius-lg)", border: "1px solid rgba(245,158,11,0.3)", color: "#fcd34d", fontSize: "0.875rem" }}>
              ⚠️ Room unassigned — contact warden.
            </div>
          )}
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid-3" style={{ marginBottom: "var(--space-xl)" }}>
        {/* Maintenance summary */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Wrench size={18} color="var(--accent-warning)" /> My Maintenance
            </h3>
            <Link to="/student/maintenance" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          {myRequests.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {myRequests.slice(0, 3).map(r => (
                <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid var(--border-subtle)" }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: "0.875rem", color: "var(--text-primary)" }}>{r.title}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                  <span className={`badge ${r.status === "RESOLVED" ? "badge-success" : r.status === "IN_PROGRESS" ? "badge-indigo" : "badge-warning"}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "1.5rem 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              No active maintenance requests.
            </div>
          )}
        </div>

        {/* Today's Mess */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <UtensilsCrossed size={18} color="var(--accent-success)" /> Today's Mess ({todayName.slice(0,3)})
            </h3>
            <Link to="/student/mess" className="btn btn-secondary btn-sm">Full Menu</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {["BREAKFAST", "LUNCH", "SNACK", "DINNER"].map(meal => {
              const items = todayMenu[meal]?.items || [];
              return (
                <div key={meal} style={{ fontSize: "0.8125rem" }}>
                  <span style={{ fontWeight: 600, color: "var(--text-secondary)", marginRight: 8 }}>{meal}:</span>
                  <span style={{ color: items.length ? "var(--text-primary)" : "var(--text-muted)" }}>
                    {items.length ? items.join(", ") : "Not set"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notifications & Announcements */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Bell size={18} color="var(--accent-primary)" /> Announcements
            </h3>
            {unreadCount > 0 && <span className="badge badge-danger">{unreadCount} new</span>}
          </div>
          {notifications.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {notifications.slice(0, 3).map(n => (
                <div key={n.id} style={{ fontSize: "0.8125rem", padding: "0.5rem", borderRadius: "var(--radius-sm)", background: n.isRead ? "transparent" : "rgba(99,102,241,0.08)" }}>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{n.title}</div>
                  <div style={{ color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.message}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "1.5rem 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              No notifications yet.
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Holidays */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CalendarDays size={18} color="var(--accent-secondary)" /> Upcoming Holidays & Events
          </h3>
        </div>
        {upcomingHolidays.length > 0 ? (
          <div className="grid-3">
            {upcomingHolidays.map(h => (
              <div key={h.id} style={{ background: "var(--bg-input)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--accent-secondary)", fontWeight: 600 }}>{new Date(h.date).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</div>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: 4 }}>{h.title}</div>
                {h.description && <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: 4 }}>{h.description}</div>}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No upcoming holidays scheduled.</div>
        )}
      </div>
    </div>
  );
}
