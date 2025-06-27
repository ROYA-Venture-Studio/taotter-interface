import React from "react";
import TaotterBlueLogo from "../../../assets/logo/Taotter_blue_logo.png";
import "./AdminSidebar.css";

export default function AdminSidebar({ open, onClose }) {
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
            src={TaotterBlueLogo}
            alt="Taotter"
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
          <div className="admin-sidebar__footer-title">Taotter</div>
          <div className="admin-sidebar__footer-subtitle">Get all your startup needs</div>
          <button className="admin-sidebar__upgrade-btn">Upgrade Plan</button>
        </div>
      </aside>
      {open && <div className="admin-sidebar__backdrop" onClick={onClose} />}
    </>
  );
}
