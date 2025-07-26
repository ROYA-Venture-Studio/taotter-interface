import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../store/slices/authSlice";
import "./AdminSidebar.css";

export default function AdminSidebar({ open, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    onClose && onClose();
    navigate("/admin/login");
  };

  return (
    <>
      <aside className={`admin-sidebar${open ? " open" : ""}`}>
        <button
          className="admin-sidebar__close"
          onClick={onClose}
          aria-label="Close menu"
        >
          ×
        </button>
        <div className="admin-sidebar__logo-wrap">
          <img
            src="/assets/logo/leansprintr.png"
            alt="LeanSprint"
            className="admin-sidebar__logo-img"
          />
        </div>
        <div className="admin-sidebar__section">
          <div className="admin-sidebar__subtitle">MENU</div>
          <nav>
            <a href="/admin/board" className="admin-sidebar__link">Board</a>
            <a href="/admin/table" className="admin-sidebar__link">Requests</a>
            <a href="/admin/startups" className="admin-sidebar__link">Startups</a>
          </nav>
        </div>
        <div className="admin-sidebar__section">
          <div className="admin-sidebar__subtitle">SUPPORT</div>
          <nav>
            <a href="/admin/chat" className="admin-sidebar__link">Chat</a>
          </nav>
        </div>
        <div className="admin-sidebar__footer">
          <button
            className="admin-sidebar__logout-btn"
            style={{
              background: "#EB5E28",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              width: "100%",
              marginTop: "8px"
            }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>
      {open && <div className="admin-sidebar__backdrop" onClick={onClose} />}
    </>
  );
}
