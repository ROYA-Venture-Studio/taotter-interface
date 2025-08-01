import React from "react";
import "./AdminHeader.css";
import { useGetCurrentUserQuery } from "../../../store/api/authApi";

export default function AdminHeader({ onMenuClick }) {
  // Fetch admin user info
  const { data } = useGetCurrentUserQuery();
  const adminName =
    data?.data?.user?.profile?.firstName && data?.data?.user?.profile?.lastName
      ? `${data.data.user.profile.firstName} ${data.data.user.profile.lastName}`
      : data?.data?.user?.email || "Admin";

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button
          className="admin-header__menu-btn"
          aria-label="Open sidebar"
          onClick={onMenuClick}
        >
          <img
            src="/assets/icons/menu-fries-left.svg"
            alt="Menu"
            style={{ width: 28, height: 28 }}
          />
        </button>
      </div>
      <div className="admin-header-spacer" />
      <div className="admin-header-right">
        <span className="admin-header__admin-name">{adminName}</span>
      </div>
    </header>
  );
}
