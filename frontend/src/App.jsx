/**
 * src/App.jsx — Application Router with Role-Based Scoped Interfaces
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";

// Layouts
import StudentLayout from "./layouts/StudentLayout";
import WardenLayout from "./layouts/WardenLayout";
import AdminLayout from "./layouts/AdminLayout";

// Public Pages
import LoginPage from "./pages/LoginPage";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import MyProfile from "./pages/student/MyProfile";
import MyRoom from "./pages/student/MyRoom";
import MyLeave from "./pages/student/MyLeave";
import MaintenancePage from "./pages/MaintenancePage";
import MessPage from "./pages/MessPage";
import NotificationsPage from "./pages/NotificationsPage";

// Warden Pages
import WardenDashboard from "./pages/warden/WardenDashboard";
import QRScanPage from "./pages/warden/QRScanPage";
import WardenRooms from "./pages/warden/WardenRooms";
import WardenLeave from "./pages/warden/WardenLeave";
import StudentsPage from "./pages/StudentsPage";
import VisitorsPage from "./pages/VisitorsPage";

// Admin Pages
import DashboardPage from "./pages/DashboardPage";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminMess from "./pages/admin/AdminMess";
import AdminNotifications from "./pages/admin/AdminNotifications";
import RoomsPage from "./pages/RoomsPage";
import HolidaysPage from "./pages/HolidaysPage";

// Role-based protection wrapper
function RoleRoute({ role, allowedRoles, layout: Layout, children }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect unauthorized user to their role home
    if (user?.role === "STUDENT") return <Navigate to="/student/dashboard" replace />;
    if (user?.role === "WARDEN") return <Navigate to="/warden/dashboard" replace />;
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
}

// Redirect home `/` to appropriate role dashboard
function HomeRedirect() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === "STUDENT") return <Navigate to="/student/dashboard" replace />;
  if (user?.role === "WARDEN") return <Navigate to="/warden/dashboard" replace />;
  return <Navigate to="/admin/dashboard" replace />;
}

// Public Route (Login)
function PublicRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    if (user?.role === "STUDENT") return <Navigate to="/student/dashboard" replace />;
    if (user?.role === "WARDEN") return <Navigate to="/warden/dashboard" replace />;
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

        {/* 🎓 STUDENT INTERFACE (/student/*) */}
        <Route path="/student/dashboard" element={<RoleRoute allowedRoles={["STUDENT", "ADMIN"]} layout={StudentLayout}><StudentDashboard /></RoleRoute>} />
        <Route path="/student/profile" element={<RoleRoute allowedRoles={["STUDENT", "ADMIN"]} layout={StudentLayout}><MyProfile /></RoleRoute>} />
        <Route path="/student/room" element={<RoleRoute allowedRoles={["STUDENT", "ADMIN"]} layout={StudentLayout}><MyRoom /></RoleRoute>} />
        <Route path="/student/maintenance" element={<RoleRoute allowedRoles={["STUDENT", "ADMIN"]} layout={StudentLayout}><MaintenancePage /></RoleRoute>} />
        <Route path="/student/mess" element={<RoleRoute allowedRoles={["STUDENT", "ADMIN"]} layout={StudentLayout}><MessPage /></RoleRoute>} />
        <Route path="/student/leave" element={<RoleRoute allowedRoles={["STUDENT", "ADMIN"]} layout={StudentLayout}><MyLeave /></RoleRoute>} />
        <Route path="/student/notifications" element={<RoleRoute allowedRoles={["STUDENT", "ADMIN"]} layout={StudentLayout}><NotificationsPage /></RoleRoute>} />

        {/* 🛡️ WARDEN INTERFACE (/warden/*) */}
        <Route path="/warden/dashboard" element={<RoleRoute allowedRoles={["WARDEN", "ADMIN"]} layout={WardenLayout}><WardenDashboard /></RoleRoute>} />
        <Route path="/warden/students" element={<RoleRoute allowedRoles={["WARDEN", "ADMIN"]} layout={WardenLayout}><StudentsPage /></RoleRoute>} />
        <Route path="/warden/rooms" element={<RoleRoute allowedRoles={["WARDEN", "ADMIN"]} layout={WardenLayout}><WardenRooms /></RoleRoute>} />
        <Route path="/warden/visitors" element={<RoleRoute allowedRoles={["WARDEN", "ADMIN"]} layout={WardenLayout}><VisitorsPage /></RoleRoute>} />
        <Route path="/warden/qr-scan" element={<RoleRoute allowedRoles={["WARDEN", "ADMIN"]} layout={WardenLayout}><QRScanPage /></RoleRoute>} />
        <Route path="/warden/maintenance" element={<RoleRoute allowedRoles={["WARDEN", "ADMIN"]} layout={WardenLayout}><MaintenancePage /></RoleRoute>} />
        <Route path="/warden/leave" element={<RoleRoute allowedRoles={["WARDEN", "ADMIN"]} layout={WardenLayout}><WardenLeave /></RoleRoute>} />
        <Route path="/warden/mess" element={<RoleRoute allowedRoles={["WARDEN", "ADMIN"]} layout={WardenLayout}><MessPage /></RoleRoute>} />
        <Route path="/warden/notifications" element={<RoleRoute allowedRoles={["WARDEN", "ADMIN"]} layout={WardenLayout}><NotificationsPage /></RoleRoute>} />

        {/* ⚙️ ADMIN INTERFACE (/admin/*) */}
        <Route path="/admin/dashboard" element={<RoleRoute allowedRoles={["ADMIN"]} layout={AdminLayout}><DashboardPage /></RoleRoute>} />
        <Route path="/admin/users" element={<RoleRoute allowedRoles={["ADMIN"]} layout={AdminLayout}><AdminUsers /></RoleRoute>} />
        <Route path="/admin/students" element={<RoleRoute allowedRoles={["ADMIN"]} layout={AdminLayout}><AdminStudents /></RoleRoute>} />
        <Route path="/admin/rooms" element={<RoleRoute allowedRoles={["ADMIN"]} layout={AdminLayout}><RoomsPage /></RoleRoute>} />
        <Route path="/admin/visitors" element={<RoleRoute allowedRoles={["ADMIN"]} layout={AdminLayout}><VisitorsPage /></RoleRoute>} />
        <Route path="/admin/maintenance" element={<RoleRoute allowedRoles={["ADMIN"]} layout={AdminLayout}><MaintenancePage /></RoleRoute>} />
        <Route path="/admin/mess" element={<RoleRoute allowedRoles={["ADMIN"]} layout={AdminLayout}><AdminMess /></RoleRoute>} />
        <Route path="/admin/holidays" element={<RoleRoute allowedRoles={["ADMIN"]} layout={AdminLayout}><HolidaysPage /></RoleRoute>} />
        <Route path="/admin/notifications" element={<RoleRoute allowedRoles={["ADMIN"]} layout={AdminLayout}><AdminNotifications /></RoleRoute>} />

        {/* Home & Catch-all redirects */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
