/**
 * src/pages/warden/WardenDashboard.jsx — Warden Operational Dashboard
 */

import { useQuery } from "react-query";
import { Users, DoorOpen, Wrench, UserCheck, CalendarDays } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { dashboardAPI } from "../../api";
import { Link } from "react-router-dom";

const PIE_COLORS = ["#10b981", "#6366f1", "#f59e0b", "#ef4444"];

export default function WardenDashboard() {
  const { data: statsRes } = useQuery("warden-dash-stats", dashboardAPI.getStats, { refetchInterval: 30000 });
  const { data: floorRes } = useQuery("warden-floor-occupancy", dashboardAPI.getOccupancyByFloor);
  const { data: maintRes } = useQuery("warden-maint-status", dashboardAPI.getMaintenanceByStatus);

  const stats = statsRes?.data?.data;
  const floorData = floorRes?.data?.data || [];
  const maintData = maintRes?.data?.data || [];

  const urgentCount = stats?.maintenance?.urgent || 0;

  return (
    <div>
      {/* SLA Alert Warning if urgent items exist */}
      {urgentCount > 0 && (
        <div className="sla-alert-banner">
          <div className="sla-dot" />
          <div style={{ flex: 1 }}>
            <strong style={{ color: "var(--accent-danger)" }}>SLA Alert: {urgentCount} Urgent Maintenance Ticket(s) Pending!</strong>
            <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
              Requires immediate attention from hostel warden / staff.
            </div>
          </div>
          <Link to="/warden/maintenance" className="btn btn-danger btn-sm">Resolve Now</Link>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1>Warden Control Center</h1>
          <p>Live hostel occupancy, visitor traffic, maintenance SLA alerts, and pending approvals.</p>
        </div>
        <Link to="/warden/visitors" className="btn btn-primary">
          <UserCheck size={18} /> Visitor Management
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid-4" style={{ marginBottom: "var(--space-xl)" }}>
        <div className="stat-card">
          <div className="stat-icon emerald"><Users size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{stats?.overview?.totalStudents ?? "—"}</div>
            <div className="stat-label">Total Residents</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><DoorOpen size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{stats?.overview?.occupancyRate != null ? `${stats.overview.occupancyRate}%` : "—"}</div>
            <div className="stat-label">Occupancy Rate</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><Wrench size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{stats?.maintenance?.pending ?? "—"}</div>
            <div className="stat-label">Pending Maintenance</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon violet"><UserCheck size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{stats?.visitors?.today ?? "—"}</div>
            <div className="stat-label">Visitors Today</div>
          </div>
        </div>
      </div>

      {/* Floor Occupancy & Maintenance Charts */}
      <div className="grid-2" style={{ marginBottom: "var(--space-xl)" }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Live Occupancy by Floor</h3>
            <Link to="/warden/rooms" className="btn btn-secondary btn-sm">Full Heatmap</Link>
          </div>
          {floorData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={floorData}>
                <XAxis dataKey="floor" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#161b27", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8, color: "#f1f5f9" }} />
                <Bar dataKey="occupied" name="Occupied Beds" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="available" name="Available Beds" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="loading-center"><div className="spinner" /></div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Maintenance Ticket Status</h3>
            <Link to="/warden/maintenance" className="btn btn-secondary btn-sm">View Queue</Link>
          </div>
          {maintData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={maintData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}>
                  {maintData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#161b27", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8, color: "#f1f5f9" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="loading-center"><div className="spinner" /></div>
          )}
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Warden Quick Operations</h3>
        </div>
        <div className="grid-4">
          <Link to="/warden/visitors" className="btn btn-secondary" style={{ padding: "1.25rem", justifyContent: "center", flexDirection: "column", gap: 8 }}>
            <UserCheck size={24} color="var(--accent-primary)" />
            <span>Visitor Log</span>
          </Link>
          <Link to="/warden/maintenance" className="btn btn-secondary" style={{ padding: "1.25rem", justifyContent: "center", flexDirection: "column", gap: 8 }}>
            <Wrench size={24} color="var(--accent-warning)" />
            <span>Maintenance Queue</span>
          </Link>
          <Link to="/warden/leave" className="btn btn-secondary" style={{ padding: "1.25rem", justifyContent: "center", flexDirection: "column", gap: 8 }}>
            <CalendarDays size={24} color="var(--accent-secondary)" />
            <span>Leave Approvals</span>
          </Link>
          <Link to="/warden/rooms" className="btn btn-secondary" style={{ padding: "1.25rem", justifyContent: "center", flexDirection: "column", gap: 8 }}>
            <DoorOpen size={24} color="var(--accent-success)" />
            <span>Occupancy Heatmap</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
