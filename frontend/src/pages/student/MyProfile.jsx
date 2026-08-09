/**
 * src/pages/student/MyProfile.jsx — Student Profile & Password Change
 */

import { useState } from "react";
import { User, Phone, Mail, BookOpen, Key, CheckCircle, Shield } from "lucide-react";
import useAuthStore from "../../store/authStore";
import { authAPI } from "../../api";
import toast from "react-hot-toast";

export default function MyProfile() {
  const { user, refreshUser } = useAuthStore();
  const student = user?.student;

  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      return toast.error("New passwords do not match!");
    }
    if (passForm.newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters!");
    }

    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      toast.success("Password changed successfully!");
      setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <p>View your personal student details and security settings.</p>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: "var(--space-xl)" }}>
        {/* Profile Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <User size={18} color="var(--accent-primary)" /> Personal Information
            </h3>
          </div>
          <div className="info-block">
            <div className="info-row">
              <span className="info-label">Full Name</span>
              <span className="info-value">{user?.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email Address</span>
              <span className="info-value">{user?.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Roll Number</span>
              <span className="info-value">{student?.rollNo || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Course / Program</span>
              <span className="info-value">{student?.course || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Current Academic Year</span>
              <span className="info-value">{student?.year ? `Year ${student.year}` : "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone Number</span>
              <span className="info-value">{student?.phone || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Parent / Guardian Name</span>
              <span className="info-value">{student?.parentName || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Parent Emergency Phone</span>
              <span className="info-value">{student?.parentPhone || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Key size={18} color="var(--accent-secondary)" /> Change Password
            </h3>
          </div>
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                required
                value={passForm.currentPassword}
                onChange={e => setPassForm(f => ({ ...f, currentPassword: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                required
                value={passForm.newPassword}
                onChange={e => setPassForm(f => ({ ...f, newPassword: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                required
                value={passForm.confirmPassword}
                onChange={e => setPassForm(f => ({ ...f, confirmPassword: e.target.value }))}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
