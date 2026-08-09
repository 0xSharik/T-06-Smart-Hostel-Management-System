/**
 * src/App.jsx — Application Router with Role-Based Scoped Interfaces
 *
 * STUDENT  → /student  — Personal portal (room, maintenance, mess, leave, notifications)
 * WARDEN   → /warden   — Operational portal (students, rooms, visitors, QR, maintenance, leave, mess, notifications)
 * ADMIN    → /admin    — System control panel (users, allotment, reports, broadcast, holidays, config, audit)
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import StudentLayout from "./layouts/StudentLayout";
import WardenLayout  from "./layouts/WardenLayout";
import AdminLayout   from "./layouts/AdminLayout";

// Public Pages
import LandingPage from "./pages/LandingPage";

// ── Student Pages ─────────────────────────────────────────────────────────────
import StudentDashboard from "./pages/student/StudentDashboard";
import MyProfile        from "./pages/student/MyProfile";
import MyRoom           from "./pages/student/MyRoom";
import MyLeave          from "./pages/student/MyLeave";
import MaintenancePage  from "./pages/MaintenancePage";
import MessPage         from "./pages/MessPage";
import NotificationsPage from "./pages/NotificationsPage";

// ── Warden Pages ──────────────────────────────────────────────────────────────
import WardenDashboard from "./pages/warden/WardenDashboard";
import WardenRooms     from "./pages/warden/WardenRooms";
import WardenLeave     from "./pages/warden/WardenLeave";
import QRScanPage      from "./pages/warden/QRScanPage";
import StudentsPage    from "./pages/StudentsPage";
import VisitorsPage    from "./pages/VisitorsPage";

// ── Admin Pages ───────────────────────────────────────────────────────────────
import DashboardPage        from "./pages/DashboardPage";
import AdminUsers           from "./pages/admin/AdminUsers";
import AdminStudents        from "./pages/admin/AdminStudents";
import AdminNotifications   from "./pages/admin/AdminNotifications";
import AdminReports         from "./pages/admin/AdminReports";
import AdminConfig          from "./pages/admin/AdminConfig";
import AdminAudit           from "./pages/admin/AdminAudit";
import HolidaysPage         from "./pages/HolidaysPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"      element={<LandingPage />} />
        <Route path="/login" element={<Navigate to="/" replace />} />

        {/* 🎓 STUDENT INTERFACE — personal hostel experience */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index           element={<StudentDashboard />} />
          <Route path="dashboard"     element={<StudentDashboard />} />
          <Route path="profile"       element={<MyProfile />} />
          <Route path="room"          element={<MyRoom />} />
          <Route path="maintenance"   element={<MaintenancePage />} />
          <Route path="mess"          element={<MessPage />} />
          <Route path="leave"         element={<MyLeave />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="*"             element={<Navigate to="/student" replace />} />
        </Route>

        {/* 🛡️ WARDEN INTERFACE — daily operational control */}
        <Route path="/warden" element={<WardenLayout />}>
          <Route index             element={<WardenDashboard />} />
          <Route path="dashboard"     element={<WardenDashboard />} />
          <Route path="students"      element={<StudentsPage />} />
          <Route path="rooms"         element={<WardenRooms />} />
          <Route path="visitors"      element={<VisitorsPage />} />
          <Route path="qr-scan"       element={<QRScanPage />} />
          <Route path="maintenance"   element={<MaintenancePage />} />
          <Route path="leave"         element={<WardenLeave />} />
          <Route path="mess"          element={<MessPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="*"             element={<Navigate to="/warden" replace />} />
        </Route>

        {/* ⚙️ ADMIN INTERFACE — system-level control only */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index                element={<DashboardPage />} />
          <Route path="dashboard"     element={<DashboardPage />} />
          <Route path="users"         element={<AdminUsers />} />
          <Route path="students"      element={<AdminStudents />} />
          <Route path="reports"       element={<AdminReports />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="holidays"      element={<HolidaysPage />} />
          <Route path="config"        element={<AdminConfig />} />
          <Route path="audit"         element={<AdminAudit />} />
          <Route path="*"             element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
