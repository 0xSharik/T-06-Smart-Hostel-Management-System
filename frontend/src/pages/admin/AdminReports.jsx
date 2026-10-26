/**
 * src/pages/admin/AdminReports.jsx — System-wide Reports & Analytics
 * All data is live from the API — no static data.
 */
import { useQuery }       from "react-query";
import {
  FileBarChart2, Users, DoorOpen, Wrench,
  TrendingUp, BarChart2, RefreshCw, Loader2,
} from "lucide-react";
import { roomAPI }        from "../../api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const PIE_COLORS = {
  Available:   "#10b981",
  Occupied:    "#f59e0b",
  Full:        "#ef4444",
  Maintenance: "#94a3b8",
};

export default function AdminReports() {
  const {
    data: roomStatsRes,
    isLoading,
    error,
    refetch,
  } = useQuery("admin-report-room-stats", roomAPI.getStats, {
    refetchOnWindowFocus: false,
  });

  const { data: allRoomsRes, isLoading: roomsLoading } = useQuery(
    "admin-report-all-rooms",
    () => roomAPI.getAll({ limit: 9999 }),
    { refetchOnWindowFocus: false }
  );

  const stats = roomStatsRes?.data?.data || null;
  const rooms = allRoomsRes?.data?.data   || [];

  const occupancyData = stats
    ? [
        { name: "Available",   value: stats.available   || 0, color: PIE_COLORS.Available   },
        { name: "Occupied",    value: stats.occupied    || 0, color: PIE_COLORS.Occupied    },
        { name: "Full",        value: stats.full        || 0, color: PIE_COLORS.Full        },
        { name: "Maintenance", value: stats.maintenance || 0, color: PIE_COLORS.Maintenance },
      ].filter(d => d.value > 0)
    : [];

  const capacityBarData = stats
    ? [
        { name: "Total Beds",  value: stats.totalCapacity  || 0 },
        { name: "Occupied",    value: stats.totalOccupancy || 0 },
        { name: "Vacant",      value: Math.max(0, (stats.totalCapacity || 0) - (stats.totalOccupancy || 0)) },
      ]
    : [];

  const typeBreakdown = rooms.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = { type: r.type, count: 0, beds: 0 };
    acc[r.type].count += 1;
    acc[r.type].beds  += r.capacity || 0;
    return acc;
  }, {});

  const typeRows = Object.values(typeBreakdown).sort((a, b) => b.beds - a.beds);

  const TYPE_DESC = {
    QUINT:  "5-seater · high-density shared, balcony",
    QUAD:   "4-seater · shared with common lounge",
    TRIPLE: "3-seater · standard shared room",
    DOUBLE: "2-seater · with attached bathroom",
    SINGLE: "1-seater · premium AC single occupancy",
  };

  const Stat = ({ icon: Icon, color, label, value }) => (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}><Icon size={22} /></div>
      <div className="stat-info">
        <div className="stat-value">
          {isLoading
            ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
            : value ?? "—"}
        </div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>System Reports &amp; Analytics</h1>
          <p>Live metrics from the database — no static data.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => refetch()}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && (
        <div className="sla-alert-banner" style={{ marginBottom: "var(--space-xl)" }}>
          <div className="sla-dot" />
          <span style={{ fontSize: "0.875rem" }}>
            Failed to load room stats from API.
          </span>
          <button className="btn btn-secondary btn-sm" onClick={() => refetch()}>Retry</button>
        </div>
      )}

      <div className="grid-4" style={{ marginBottom: "var(--space-xl)" }}>
        <Stat icon={DoorOpen}    color="violet"  label="Total Rooms"       value={stats?.total} />
        <Stat icon={Users}       color="emerald" label="Beds Occupied"     value={stats?.totalOccupancy} />
        <Stat icon={TrendingUp}  color="amber"   label="Occupancy Rate"    value={stats ? `${stats.occupancyRate}%` : null} />
        <Stat icon={Wrench}      color="red"     label="Under Maintenance" value={stats?.maintenance} />
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
          <Loader2 size={36} style={{ animation: "spin 1s linear infinite", marginBottom: "1rem" }} />
          <div>Loading analytics from API…</div>
        </div>
      ) : stats ? (
        <>
          <div className="grid-2" style={{ marginBottom: "var(--space-xl)" }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <BarChart2 size={18} color="var(--accent-primary)" />
                  Room Status Distribution
                </h3>
              </div>
              {occupancyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={occupancyData}
                      dataKey="value"
                      cx="50%" cy="50%"
                      outerRadius={90}
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {occupancyData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#161b27", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 8, color: "#f1f5f9" }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                  No room data available
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <BarChart2 size={18} color="var(--accent-primary)" />
                  Bed Capacity vs Occupancy
                </h3>
              </div>
              {capacityBarData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={capacityBarData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#161b27", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 8, color: "#f1f5f9" }}
                    />
                    <Bar dataKey="value" fill="#c8102e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                  No capacity data available
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="card-header" style={{ padding: "1.5rem 1.5rem 0" }}>
              <h3 className="card-title">
                Room Type Breakdown
                <span style={{ marginLeft: 8, fontSize: "0.75rem", fontWeight: 400, color: "var(--text-muted)" }}>
                  — computed from {rooms.length} rooms in database
                </span>
              </h3>
            </div>

            {roomsLoading ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
              </div>
            ) : typeRows.length > 0 ? (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Room Type</th>
                      <th>Seater</th>
                      <th>Rooms</th>
                      <th>Total Beds</th>
                      <th>% of Beds</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {typeRows.map(row => {
                      const pct = stats?.totalCapacity
                        ? ((row.beds / stats.totalCapacity) * 100).toFixed(1)
                        : "—";
                      return (
                        <tr key={row.type}>
                          <td><span className="badge badge-secondary">{row.type}</span></td>
                          <td style={{ color: "var(--text-secondary)" }}>
                            {row.type === "SINGLE" ? 1
                              : row.type === "DOUBLE" ? 2
                              : row.type === "TRIPLE" ? 3
                              : row.type === "QUAD"   ? 4
                              : 5}-seater
                          </td>
                          <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{row.count}</td>
                          <td style={{ color: "var(--accent-primary)", fontWeight: 600 }}>{row.beds}</td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <div className="progress-bar" style={{ flex: 1, maxWidth: 80 }}>
                                <div className="progress-fill" style={{ width: `${pct}%` }} />
                              </div>
                              <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{pct}%</span>
                            </div>
                          </td>
                          <td style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                            {TYPE_DESC[row.type] || ""}
                          </td>
                        </tr>
                      );
                    })}

                    <tr style={{ background: "rgba(139,92,246,0.06)", fontWeight: 700 }}>
                      <td colSpan={2} style={{ color: "var(--text-primary)" }}>Total</td>
                      <td style={{ color: "var(--text-primary)" }}>{typeRows.reduce((s, r) => s + r.count, 0)}</td>
                      <td style={{ color: "var(--accent-primary)" }}>{typeRows.reduce((s, r) => s + r.beds, 0)}</td>
                      <td>100%</td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>All room types combined</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                No room type data available.
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
          No data returned from API.
        </div>
      )}
    </div>
  );
}
