/**
 * src/pages/admin/AdminAudit.jsx — System Audit Logs
 */
import { useState } from "react";
import { Database, Shield, AlertTriangle, CheckCircle2, Clock, Search } from "lucide-react";

const SAMPLE_LOGS = [
  { id: 1, action: "USER_CREATED",        actor: "admin@hostel.com",   target: "student5@hostel.com",  level: "INFO",    ts: "2026-08-09 20:45:12" },
  { id: 2, action: "ROOM_ALLOTMENT_RUN",  actor: "admin@hostel.com",   target: "500 rooms / 2000 students", level: "INFO", ts: "2026-08-09 20:44:08" },
  { id: 3, action: "BROADCAST_SENT",      actor: "admin@hostel.com",   target: "All STUDENTS (2000)",   level: "INFO",    ts: "2026-08-09 20:40:55" },
  { id: 4, action: "LOGIN_FAILED",        actor: "unknown@hostel.com", target: "Login endpoint",        level: "WARNING", ts: "2026-08-09 20:38:22" },
  { id: 5, action: "ROLE_CHANGED",        actor: "admin@hostel.com",   target: "user#1234 → WARDEN",    level: "WARN",    ts: "2026-08-09 20:35:01" },
  { id: 6, action: "HOLIDAY_CREATED",     actor: "admin@hostel.com",   target: "Independence Day",      level: "INFO",    ts: "2026-08-09 20:30:44" },
  { id: 7, action: "SCHEMA_MIGRATED",     actor: "system",             target: "add_quad_quint_types",  level: "SYSTEM",  ts: "2026-08-09 15:10:50" },
  { id: 8, action: "DB_SEED_COMPLETE",    actor: "system",             target: "500 rooms, 2000 students", level: "SYSTEM", ts: "2026-08-09 15:24:10" },
  { id: 9, action: "CONFIG_UPDATED",      actor: "admin@hostel.com",   target: "Gate closing: 22:00",   level: "INFO",    ts: "2026-08-09 14:55:30" },
  { id: 10, action: "USER_DELETED",       actor: "admin@hostel.com",   target: "test_user@hostel.com",  level: "WARNING", ts: "2026-08-09 14:20:15" },
];

const LEVEL_STYLES = {
  INFO:    { badge: "badge-info", icon: CheckCircle2, color: "var(--accent-info)" },
  WARN:    { badge: "badge-warning", icon: AlertTriangle, color: "var(--accent-warning)" },
  WARNING: { badge: "badge-warning", icon: AlertTriangle, color: "var(--accent-warning)" },
  SYSTEM:  { badge: "badge-success", icon: Shield, color: "var(--accent-success)" },
  ERROR:   { badge: "badge-danger", icon: AlertTriangle, color: "var(--accent-danger)" },
};

export default function AdminAudit() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("");

  const filtered = SAMPLE_LOGS.filter(log => {
    const matchSearch = !search || log.action.includes(search.toUpperCase()) || log.actor.includes(search) || log.target.includes(search);
    const matchLevel  = !levelFilter || log.level === levelFilter;
    return matchSearch && matchLevel;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>System Audit Logs</h1>
          <p>Track all admin-level actions, system events, and security incidents across the hostel platform.</p>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: "var(--space-xl)" }}>
        <div className="stat-card">
          <div className="stat-icon violet"><Database size={22} /></div>
          <div className="stat-info"><div className="stat-value">{SAMPLE_LOGS.length}</div><div className="stat-label">Total Events</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><CheckCircle2 size={22} /></div>
          <div className="stat-info"><div className="stat-value">{SAMPLE_LOGS.filter(l => l.level === "INFO").length}</div><div className="stat-label">Info Events</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><AlertTriangle size={22} /></div>
          <div className="stat-info"><div className="stat-value">{SAMPLE_LOGS.filter(l => l.level === "WARNING" || l.level === "WARN").length}</div><div className="stat-label">Warnings</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon emerald"><Shield size={22} /></div>
          <div className="stat-info"><div className="stat-value">{SAMPLE_LOGS.filter(l => l.level === "SYSTEM").length}</div><div className="stat-label">System Events</div></div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "var(--space-lg)", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Search actions, actors, targets..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 160 }} value={levelFilter} onChange={e => setLevelFilter(e.target.value)}>
          <option value="">All Levels</option>
          <option value="INFO">INFO</option>
          <option value="WARNING">WARNING</option>
          <option value="SYSTEM">SYSTEM</option>
          <option value="ERROR">ERROR</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Action</th>
                <th>Actor</th>
                <th>Target / Detail</th>
                <th>Level</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => {
                const style = LEVEL_STYLES[log.level] || LEVEL_STYLES.INFO;
                const Icon = style.icon;
                return (
                  <tr key={log.id}>
                    <td style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{log.id}</td>
                    <td><span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--text-primary)", fontWeight: 600 }}>{log.action}</span></td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.8125rem" }}>{log.actor}</td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.8125rem", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.target}</td>
                    <td>
                      <span className={`badge ${style.badge}`} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <Icon size={11} /> {log.level}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={11} /> {log.ts}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
