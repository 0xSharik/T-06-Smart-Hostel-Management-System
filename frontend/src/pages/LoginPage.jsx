/**
 * src/pages/LoginPage.jsx
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Mail, Lock, LogIn, ShieldCheck, UserRound, GraduationCap } from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

const roleOptions = [
  {
    role: "ADMIN",
    title: "Admin",
    description: "Users, rooms, reports",
    email: "admin@hostel.com",
    password: "Admin@1234",
    path: "/admin/dashboard",
    icon: ShieldCheck,
  },
  {
    role: "WARDEN",
    title: "Warden",
    description: "Visitors, rooms, tickets",
    email: "warden@hostel.com",
    password: "Warden@1234",
    path: "/warden/dashboard",
    icon: UserRound,
  },
  {
    role: "STUDENT",
    title: "Student",
    description: "Room, mess, leave",
    email: "student1@hostel.com",
    password: "Student@1234",
    path: "/student/dashboard",
    icon: GraduationCap,
  },
];

const getRolePath = (role) => {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "WARDEN") return "/warden/dashboard";
  return "/student/dashboard";
};

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(roleOptions[1]);
  const [email, setEmail] = useState(roleOptions[1].email);
  const [password, setPassword] = useState(roleOptions[1].password);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const selectRole = (option) => {
    setSelectedRole(option);
    setEmail(option.email);
    setPassword(option.password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      const user = useAuthStore.getState().user;
      toast.success("Welcome back!");
      navigate(getRolePath(user?.role || selectedRole.role), { replace: true });
    } else {
      toast.error(result.message || "Login failed");
    }
  };

  return (
    <div className="login-page landing-login">
      <section className="login-intro">
        <div className="login-mark">
          <Building2 size={30} />
        </div>
        <div>
          <span className="eyebrow">SmartHostel Operations</span>
          <h1>One entry point for every hostel role.</h1>
          <p>
            Sign in as a student, warden, or administrator and land directly on the dashboard built for that workflow.
          </p>
        </div>
        <div className="login-proof-grid">
          <div><strong>100</strong><span>rooms</span></div>
          <div><strong>200</strong><span>students</span></div>
          <div><strong>8h</strong><span>QR passes</span></div>
        </div>
      </section>

      <div className="login-card role-login-card">
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.35rem" }}>Choose Login</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Pick a role to load demo credentials.
          </p>
        </div>

        <div className="role-picker" aria-label="Demo role selector">
          {roleOptions.map((option) => {
            const Icon = option.icon;
            const active = selectedRole.role === option.role;
            return (
              <button
                key={option.role}
                type="button"
                className={`role-choice ${active ? "active" : ""}`}
                onClick={() => selectRole(option)}
              >
                <Icon size={18} />
                <span>
                  <strong>{option.title}</strong>
                  <small>{option.description}</small>
                </span>
              </button>
            );
          })}
        </div>

        <div className="selected-login-note">
          <div>
            <span>Signing in as</span>
            <strong>{selectedRole.title}</strong>
          </div>
          <span className="badge badge-secondary">{selectedRole.path.replace("/", "")}</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                id="login-email"
                type="email"
                className="form-input"
                style={{ paddingLeft: "40px" }}
                placeholder="you@hostel.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                id="login-password"
                type="password"
                className="form-input"
                style={{ paddingLeft: "40px" }}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
            ) : (
              <>
                <LogIn size={18} />
                Enter {selectedRole.title} Dashboard
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
