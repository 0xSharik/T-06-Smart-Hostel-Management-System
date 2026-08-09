/**
 * src/layouts/StudentLayout.jsx — Student Portal Layout
 * Indigo theme, student-specific sidebar navigation
 */

import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, User, DoorOpen, Wrench,
  UtensilsCrossed, CalendarDays, Bell, LogOut,
  Building2, GraduationCap, Menu, X
} from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import Header from "../components/Header";

const studentNav = [
  { section: "My Space", items: [
    { to: "/student/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/student/profile",   icon: User,            label: "My Profile" },
    { to: "/student/room",      icon: DoorOpen,        label: "My Room" },
  ]},
  { section: "Services", items: [
    { to: "/student/maintenance", icon: Wrench,           label: "Maintenance" },
    { to: "/student/mess",        icon: UtensilsCrossed,  label: "Mess Menu" },
    { to: "/student/leave",       icon: CalendarDays,     label: "Leave Request" },
  ]},
  { section: "Account", items: [
    { to: "/student/notifications", icon: Bell, label: "Notifications" },
  ]},
];

const pageTitles = {
  "/student/dashboard":     "Dashboard",
  "/student/profile":       "My Profile",
  "/student/room":          "My Room",
  "/student/maintenance":   "Maintenance",
  "/student/mess":          "Mess Menu",
  "/student/leave":         "Leave Requests",
  "/student/notifications": "Notifications",
};

export default function StudentLayout({ children }) {
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

  const title = pageTitles[pathname] || "Student Portal";

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <GraduationCap size={20} color="white" />
          </div>
          <div>
            <div className="sidebar-logo-text">Student Portal</div>
            <div className="sidebar-logo-sub">SmartHostel</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {studentNav.map(({ section, items }) => (
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
            <div className="user-avatar" style={{ width: 36, height: 36, fontSize: "0.8125rem" }}>
              {getInitials(user?.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name}
              </div>
              <span className="role-badge student">Student</span>
            </div>
          </div>
          <button className="nav-link" onClick={handleLogout} style={{ width: "100%", color: "var(--accent-danger)" }}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <div className="header-left">
            <button className="hamburger" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle sidebar">
              <span /><span /><span />
            </button>
            <span className="header-title">{title}</span>
          </div>
          <div className="header-right">
            <NavLink to="/student/notifications">
              <Bell size={20} color="var(--text-secondary)" />
            </NavLink>
            <div className="user-avatar" style={{ width: 32, height: 32, fontSize: "0.75rem" }}>
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
