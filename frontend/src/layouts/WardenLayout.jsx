/**
 * src/layouts/WardenLayout.jsx — Warden Interface Layout
 * Emerald theme, warden-specific sidebar navigation
 */

import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, DoorOpen, UserCheck,
  Wrench, UtensilsCrossed, CalendarDays, Bell, LogOut,
  ShieldCheck
} from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

const wardenNav = [
  { section: "Overview", items: [
    { to: "/warden/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  ]},
  { section: "Residents", items: [
    { to: "/warden/students", icon: Users,   label: "Students" },
    { to: "/warden/rooms",    icon: DoorOpen, label: "Rooms & Map" },
  ]},
  { section: "Operations", items: [
    { to: "/warden/visitors",    icon: UserCheck,  label: "Visitors" },
    { to: "/warden/maintenance", icon: Wrench,     label: "Maintenance" },
    { to: "/warden/leave",       icon: CalendarDays, label: "Leave Approvals" },
  ]},
  { section: "Mess", items: [
    { to: "/warden/mess", icon: UtensilsCrossed, label: "Menu & Analytics" },
  ]},
  { section: "Account", items: [
    { to: "/warden/notifications", icon: Bell, label: "Notifications" },
  ]},
];

const pageTitles = {
  "/warden/dashboard":     "Warden Dashboard",
  "/warden/students":      "Students",
  "/warden/rooms":         "Rooms & Heatmap",
  "/warden/visitors":      "Visitor Dashboard",
  "/warden/qr-scan":       "QR Scanner",
  "/warden/maintenance":   "Maintenance Queue",
  "/warden/leave":         "Leave Approvals",
  "/warden/mess":          "Mess Management",
  "/warden/notifications": "Notifications",
};

export default function WardenLayout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const getInitials = (name) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  const title = pageTitles[pathname] || "Warden Portal";

  return (
    <div className="app-layout role-warden">
      <div
        className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <ShieldCheck size={20} color="white" />
          </div>
          <div>
            <div className="sidebar-logo-text">Warden Portal</div>
            <div className="sidebar-logo-sub">SmartHostel</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {wardenNav.map(({ section, items }) => (
            <div key={section} className="sidebar-section">
              <div className="sidebar-section-label">{section}</div>
              {items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div style={{ padding: "var(--space-md)", borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)", padding: "var(--space-sm)", marginBottom: "var(--space-sm)" }}>
            <div className="user-avatar" style={{ width: 36, height: 36, fontSize: "0.8125rem", background: "linear-gradient(135deg, #10b981, #059669)" }}>
              {getInitials(user?.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name}
              </div>
              <span className="role-badge warden">Warden</span>
            </div>
          </div>
          <button className="nav-link" onClick={handleLogout} style={{ width: "100%", color: "var(--accent-danger)" }}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="header">
          <div className="header-left">
            <button className="hamburger" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle sidebar">
              <span /><span /><span />
            </button>
            <span className="header-title">{title}</span>
          </div>
          <div className="header-right">
            <NavLink to="/warden/notifications">
              <Bell size={20} color="var(--text-secondary)" />
            </NavLink>
            <div className="user-avatar" style={{ width: 32, height: 32, fontSize: "0.75rem", background: "linear-gradient(135deg, #10b981, #059669)" }}>
              {getInitials(user?.name)}
            </div>
          </div>
        </header>
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
