/**
 * src/components/Header.jsx
 */

import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Header({ title }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const getInitials = (name) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <header className="header">
      <div className="header-left">
        <h2 className="header-title">{title}</h2>
      </div>
      <div className="header-right">
        <button
          className="btn btn-icon btn-secondary"
          onClick={() => navigate("/notifications")}
          title="Notifications"
          id="header-notifications-btn"
        >
          <Bell size={18} />
        </button>
        <div
          className="user-avatar"
          title={user?.name}
          onClick={() => navigate("/profile")}
        >
          {getInitials(user?.name)}
        </div>
      </div>
    </header>
  );
}
