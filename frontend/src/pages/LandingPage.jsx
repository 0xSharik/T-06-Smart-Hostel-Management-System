/**
 * src/pages/LandingPage.jsx — Public landing page for Smart Hostel Management System
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Mail, Lock, LogIn, ShieldCheck, UserRound, GraduationCap } from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import "./LandingPage.css"; // Import our custom CSS for this page

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

export default function LandingPage() {
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
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Smart Hostel Management</h1>
          <p>
            Streamline hostel operations with role‑based dashboards for students, wardens, and administrators.
          </p>
          <div className="hero-actions">
            <a href="#features" className="btn btn-primary">Explore Features</a>
            <button
              onClick={() => document.getElementById("login-section")?.scrollIntoView({ behavior: "smooth" })}
              className="btn btn-secondary"
            >
              Login Demo
            </button>
          </div>
        </div>
        {/* Animated background shapes */}
        <div className="hero-bg">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="features-container">
          <h2>Features</h2>
          <div className="features-grid">
            {/* Feature Card */}
            <div className="feature-card">
              <div className="feature-icon">
                <Building2 size={24} />
              </div>
              <h3>Comprehensive Room Management</h3>
              <p>
                Allocate, monitor, and manage rooms in real time with occupancy tracking and maintenance alerts.
              </p>
            </div>
            {/* Feature Card */}
            <div className="feature-card">
              <div className="feature-icon">
                <UserRound size={24} />
              </div>
              <h3>Student Self‑Service Portal</h3>
              <p>
                Students can view room details, submit maintenance requests, check mess menus, and apply for leave.
              </p>
            </div>
            {/* Feature Card */}
            <div className="feature-card">
              <div className="feature-icon">
                <ShieldCheck size={24} />
              </div>
              <h3>Admin Controls & Analytics</h3>
              <p>
                Manage users, rooms, mess, holidays, and generate reports with role‑based access control.
              </p>
            </div>
            {/* Feature Card */}
            <div className="feature-card">
              <div className="feature-icon">
                <Mail size={24} />
              </div>
              <h3>Mess & Nutrition Management</h3>
              <p>
                Plan menus, track inventory, and manage meal allocations for students and staff.
              </p>
            </div>
            {/* Feature Card */}
            <div className="feature-card">
              <div className="feature-icon">
                <LogIn size={24} />
              </div>
              <h3>Visitor & QR Pass System</h3>
              <p>
                Issue time‑limited QR codes for visitors, track entries/exits, and enhance hostel security.
              </p>
            </div>
            {/* Feature Card */}
            <div className="feature-card">
              <div className="feature-icon">
                <Lock size={24} />
              </div>
              <h3>Leave & Maintenance Ticketing</h3>
              <p>
                Students submit leave requests; wardens approve. Maintenance tickets are tracked to resolution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="testimonials-container">
          <h2>What Users Say</h2>
          <div className="testimonials-grid">
            {/* Testimonial */}
            <div className="testimonial-card">
              <p>
                "The Smart Hostel system has cut our administrative workload by half. Real‑time room tracking is a game‑changer."
              </p>
              <div className="testimonial-author">
                <div className="author-initials">AW</div>
                <div>
                  <h4>Anna Warden</h4>
                  <p>Hostel Warden</p>
                </div>
              </div>
            </div>
            {/* Testimonial */}
            <div className="testimonial-card">
              <p>
                "As a student, I love being able to check my room status, mess menu, and apply for leave from my phone."
              </p>
              <div className="testimonial-author">
                <div className="author-initials">SR</div>
                <div>
                  <h4>Sameer Rao</h4>
                  <p>Final Year Student</p>
                </div>
              </div>
            </div>
            {/* Testimonial */}
            <div className="testimonial-card">
              <p>
                "The admin dashboard gives me full control over users, rooms, and reports. Security via role‑based access is excellent."
              </p>
              <div className="testimonial-author">
                <div className="author-initials">MK</div>
                <div>
                  <h4>Manish Kapoor</h4>
                  <p>Hostel Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section id="login-section" className="login-section">
        <div className="login-container">
          <h2>Login to Continue</h2>
          <p>
            Choose your role to load demo credentials and experience the dashboard.
          </p>

          {/* Role Picker */}
          <div className="role-picker">
            <h3>Select Role</h3>
            <div className="role-choices">
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
                    <Icon size={20} />
                    <div className="role-info">
                      <div className="role-title">{option.title}</div>
                      <div className="role-desc">{option.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Role Note */}
          <div className="selected-role-note">
            Signing in as <strong>{selectedRole.title}</strong>{" "}
            <span className="role-path">{selectedRole.path.replace("/", "")}</span>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <div className="input-group">
                <Mail size={16} className="input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className="input-field"
                  placeholder="you@hostel.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="input-group">
                <Lock size={16} className="input-icon" />
                <input
                  id="login-password"
                  type="password"
                  className="input-field"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-fullwidth"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <LogIn size={18} />
                  Enter {selectedRole.title} Dashboard
                </>
              )}
            </button>
          </form>

          <div className="login-note">
            Demo credentials are pre‑filled based on the selected role.
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-content">
          <p>
            &copy; {new Date().getFullYear()} Smart Hostel Management System. All rights reserved.
          </p>
          <div className="footer-links">
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
