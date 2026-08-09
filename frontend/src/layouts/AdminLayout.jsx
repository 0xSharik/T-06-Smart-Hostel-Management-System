/**
 * src/layouts/AdminLayout.jsx — Admin Interface Layout
 * Violet theme, admin-specific sidebar navigation
 */

import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, DoorOpen, UserCheck,
  Wrench, UtensilsCrossed, CalendarDays, Bell, LogOut,
  Settings, UserPlus, Building2, QrCode
} from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

const adminNav = [
  { section: "System Overview", items: [
    { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  ]},
  { section: "User & Access Management", items: [
    { to: "/admin/users",     icon: Settings,  label: "User Accounts" },
    { to: "/admin/students",  icon: Users,     label: "Students & Allotment" },
  ]},
  { section: "Hostel Management", items: [
    { to: "/admin/rooms",       icon: DoorOpen, label: "Rooms & Heatmap" },
    { to: "/admin/visitors",    icon: UserCheck, label: "Visitors & QR" },
    { to: "/admin/maintenance", icon: Wrench,    label: "Maintenance & SLA" },
  ]},
  { section: "Services & Comms", items: [
    { to: "/admin/mess",          icon: UtensilsCrossed, label: "Mess & Analytics" },
    { to: "/admin/holidays",      icon: CalendarDays,    label: "Holidays" },
    { to: "/admin/notifications", icon: Bell,            label: "Notifications & Broadcast" },
  ]},
];

const pageTitles = {
  "/admin/dashboard":     "Admin Dashboard",
  "/admin/users":         "User Management",
  "/admin/students":      "Students & Allotment",
  "/admin/rooms":         "Rooms & Heatmap",
  "/admin/visitors":      "Visitor Management",
  "/admin/maintenance":   "Maintenance & SLA Reports",
  "/admin/mess":          "Mess Analytics & Menu",
  "/admin/holidays":      "Holiday Calendar",
  "/admin/notifications": "Notifications & Broadcast",
};

export default function AdminLayout({ children }) {
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

  const title = pageTitles[pathname] || "Admin Console";

  return (
    <div className="app-layout role-admin">
      <div
        className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Building2 size={20} color="white" />
          </div>
          <div>
            <div className="sidebar-logo-text">Admin Console</div>
            <div className="sidebar-logo-sub">SmartHostel</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {adminNav.map(({ section, items }) => (
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
            <div className="user-avatar" style={{ width: 36, height: 36, fontSize: "0.8125rem", background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}>
              {getInitials(user?.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name}
              </div>
              <span className="role-badge admin">Administrator</span>
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
            <NavLink to="/admin/notifications">
              <Bell size={20} color="var(--text-secondary)" />
            </NavLink>
            <div className="user-avatar" style={{ width: 32, height: 32, fontSize: "0.75rem", background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}>
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
