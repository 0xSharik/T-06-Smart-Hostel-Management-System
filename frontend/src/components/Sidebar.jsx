/**
 * src/components/Sidebar.jsx
 */

import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, DoorOpen, UserCheck,
  Wrench, UtensilsCrossed, CalendarDays, Bell, LogOut, Building2
} from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", section: "Main" },
  { to: "/students", icon: Users, label: "Students", section: "Management" },
  { to: "/rooms", icon: DoorOpen, label: "Rooms", section: "Management" },
  { to: "/visitors", icon: UserCheck, label: "Visitors", section: "Management" },
  { to: "/maintenance", icon: Wrench, label: "Maintenance", section: "Services" },
  { to: "/mess", icon: UtensilsCrossed, label: "Mess Menu", section: "Services" },
  { to: "/holidays", icon: CalendarDays, label: "Holidays", section: "Services" },
  { to: "/notifications", icon: Bell, label: "Notifications", section: "Account" },
];

const sections = ["Main", "Management", "Services", "Account"];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const getInitials = (name) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Building2 size={20} color="white" />
        </div>
        <div>
          <div className="sidebar-logo-text">SmartHostel</div>
          <div className="sidebar-logo-sub">Management System</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {sections.map((section) => {
          const items = navItems.filter((i) => i.section === section);
          if (!items.length) return null;
          return (
            <div key={section} className="sidebar-section">
              <div className="sidebar-section-label">{section}</div>
              {items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: "var(--space-md)", borderTop: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)", padding: "var(--space-sm)", marginBottom: "var(--space-sm)" }}>
          <div className="user-avatar" style={{ width: 36, height: 36, fontSize: "0.8125rem" }}>
            {getInitials(user?.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.name}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{user?.role}</div>
          </div>
        </div>
        <button className="nav-link" onClick={handleLogout} style={{ width: "100%", color: "var(--accent-danger)" }}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
