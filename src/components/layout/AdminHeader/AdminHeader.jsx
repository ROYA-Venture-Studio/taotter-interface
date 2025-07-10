import React from "react";
import "./AdminHeader.css";
import Icon from "../../ui/Icon/Icon";

export default function AdminHeader({ onMenuClick }) {
  return (
    <header className="admin-header">
      <button
        className="admin-header__menu-btn"
        aria-label="Open sidebar"
        onClick={onMenuClick}
      >
        <Icon name="Menu-2" size={24} />
      </button>
      <div className="admin-header__content">
        {/* Add any additional header content here */}
      </div>
    </header>
  );
}
