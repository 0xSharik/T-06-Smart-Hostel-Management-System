/**
 * src/components/Layout.jsx — Main App Layout Wrapper
 */

import Sidebar from "./Sidebar";
import Header from "./Header";
import { useLocation } from "react-router-dom";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/students": "Students",
  "/rooms": "Rooms",
  "/visitors": "Visitor Log",
  "/maintenance": "Maintenance",
  "/mess": "Mess Menu",
  "/holidays": "Holidays",
  "/notifications": "Notifications",
};

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const title = pageTitles[pathname] || "Smart Hostel";

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title={title} />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
