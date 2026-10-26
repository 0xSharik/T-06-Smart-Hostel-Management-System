/**
 * src/pages/DashboardPage.jsx
 */

import { useQuery } from "react-query";
import { Users, DoorOpen, Wrench, UserCheck, CalendarDays, BedDouble, TrendingUp, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { dashboardAPI } from "../api";

const PIE_COLORS = ["#c8102e", "#07866f", "#f59e0b", "#64748b"];

function StatCard({ icon: Icon, value, label, colorClass }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div className="stat-info">
        <div className="stat-value">{value ?? <span className="animate-pulse">—</span>}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: statsRes, isLoading } = useQuery("dashboard-stats", dashboardAPI.getStats, { refetchInterval: 60000 });
  const { data: floorRes } = useQuery("floor-occupancy", dashboardAPI.getOccupancyByFloor);
  const { data: maintRes } = useQuery("maintenance-status", dashboardAPI.getMaintenanceByStatus);

  const stats = statsRes?.data?.data;
  const floorData = floorRes?.data?.data || [];
  const maintData = maintRes?.data?.data || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back — here's what's happening in the hostel today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-4" style={{ marginBottom: "var(--space-xl)" }}>
        <StatCard icon={Users} value={stats?.overview?.totalStudents} label="Total Students" colorClass="indigo" />
        <StatCard icon={DoorOpen} value={stats?.overview?.totalRooms} label="Total Rooms" colorClass="violet" />
        <StatCard icon={BedDouble} value={stats?.overview?.occupancyRate != null ? `${stats.overview.occupancyRate}%` : null} label="Occupancy Rate" colorClass="emerald" />
        <StatCard icon={UserCheck} value={stats?.visitors?.today} label="Visitors Today" colorClass="blue" />
      </div>

      <div className="grid-4" style={{ marginBottom: "var(--space-xl)" }}>
        <StatCard icon={Wrench} value={stats?.maintenance?.pending} label="Pending Requests" colorClass="amber" />
        <StatCard icon={AlertTriangle} value={stats?.maintenance?.urgent} label="Urgent Issues" colorClass="red" />
        <StatCard icon={TrendingUp} value={stats?.overview?.availableSeats} label="Available Beds" colorClass="emerald" />
        <StatCard icon={CalendarDays} value={stats?.holidays?.upcoming} label="Upcoming Holidays" colorClass="violet" />
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: "var(--space-xl)" }}>
        {/* Floor Occupancy Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Occupancy by Floor</h3>
          </div>
          {floorData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={floorData} barCategoryGap="30%">
                <XAxis dataKey="floor" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1e2438", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, color: "#f1f5f9" }}
                  cursor={{ fill: "rgba(99,102,241,0.05)" }}
                />
                <Bar dataKey="occupied" name="Occupied" fill="#c8102e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="available" name="Available" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="loading-center"><div className="spinner" /></div>
          )}
        </div>

        {/* Maintenance Pie Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Maintenance Requests</h3>
          </div>
          {maintData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={maintData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {maintData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1e2438", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, color: "#f1f5f9" }} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="loading-center"><div className="spinner" /></div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid-2">
        {/* Recent Students */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Admissions</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll No</th>
                  <th>Room</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recent?.students?.length > 0 ? (
                  stats.recent.students.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>{s.user?.name}</div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{s.course}</div>
                      </td>
                      <td>{s.rollNo}</td>
                      <td>{s.room?.roomNo || <span style={{ color: "var(--text-muted)" }}>Unassigned</span>}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>No recent students</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Maintenance */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Maintenance</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Issue</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recent?.maintenance?.length > 0 ? (
                  stats.recent.maintenance.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div style={{ fontWeight: 500, color: "var(--text-primary)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{m.user?.name}</div>
                      </td>
                      <td>
                        <span className={`badge ${m.priority === "URGENT" ? "badge-danger" : m.priority === "HIGH" ? "badge-warning" : "badge-secondary"}`}>
                          {m.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${m.status === "RESOLVED" ? "badge-success" : m.status === "IN_PROGRESS" ? "badge-indigo" : m.status === "REJECTED" ? "badge-danger" : "badge-warning"}`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>No maintenance requests</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
