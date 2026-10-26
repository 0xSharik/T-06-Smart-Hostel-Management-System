/**
 * src/layouts/AdminLayout.jsx — Admin Interface Layout
 * Violet theme · Admin-only navigation (system-level control, NOT warden ops)
 */

import { useState } from "react";
import { NavLink, useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Megaphone,
  Database,
  Settings2,
  LogOut,
  Building2,
  FileBarChart2,
  ClipboardList,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import ThemeToggle from "../components/ThemeToggle";

const adminNav = [
  {
    section: "System Overview",
    items: [
      { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard & Analytics" },
      { to: "/admin/reports",   icon: FileBarChart2,   label: "System Reports" },
    ],
  },
  {
    section: "Access & Accounts",
    items: [
      { to: "/admin/users",    icon: UserCog,    label: "User Accounts & Roles" },
      { to: "/admin/students", icon: Users,       label: "Students & Allotment" },
    ],
  },
  {
    section: "Communications",
    items: [
      { to: "/admin/notifications", icon: Megaphone,     label: "Broadcast & Announcements" },
      { to: "/admin/holidays",      icon: ClipboardList, label: "Holiday Calendar" },
    ],
  },
  {
    section: "System Config",
    items: [
      { to: "/admin/config", icon: Settings2, label: "Hostel Configuration" },
      { to: "/admin/audit",  icon: Database,   label: "Audit Logs" },
    ],
  },
];

const pageTitles = {
  "/admin/dashboard":     "Admin Dashboard & Analytics",
  "/admin/reports":       "System Reports",
  "/admin/users":         "User Accounts & Roles",
  "/admin/students":      "Students & Allotment Engine",
  "/admin/notifications": "Broadcast & Announcements",
  "/admin/holidays":      "Holiday Calendar",
  "/admin/config":        "Hostel Configuration",
  "/admin/audit":         "Audit Logs",
};

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
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
          <div className="sidebar-logo-icon" style={{ background: "#c8102e" }}>
            <Building2 size={20} color="white" />
          </div>
          <div>
            <div className="sidebar-logo-text">Admin Console</div>
            <div className="sidebar-logo-sub">SmartHostel System</div>
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
            <div className="user-avatar" style={{ width: 36, height: 36, fontSize: "0.8125rem", background: "#c8102e" }}>
              {getInitials(user?.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name}
              </div>
              <span className="role-badge admin">System Admin</span>
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
            <ThemeToggle />
            <NavLink to="/admin/notifications">
              <Megaphone size={20} color="var(--text-secondary)" />
            </NavLink>
            <div className="user-avatar" style={{ width: 32, height: 32, fontSize: "0.75rem", background: "#c8102e" }}>
              {getInitials(user?.name)}
            </div>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
