import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./StartupHeader.css";
import Icon from "../../ui/Icon/Icon";
import { logout } from "../../../store/slices/authSlice";

const StartupHeader = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleChatClick = (e) => {
    e.preventDefault();
    setSidebarOpen(false);
    navigate("/startup/chat");
  };

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(logout());
    setSidebarOpen(false);
    navigate("/startup/login");
  };

  return (
    <>
      <header className="startup-header">
        {isAuthenticated && (
          <>
            <button
              className="startup-header__menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M44 14L4 14" stroke="#ADADAD" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M38 24H10" stroke="#ADADAD" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M32 34H16" stroke="#ADADAD" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="startup-header__user-info">
              <img
                src={user?.profile?.avatar || "/assets/icons/User.svg"}
                alt={user?.profile?.firstName || "User"}
                className="startup-header__user-avatar"
              />
              <span className="startup-header__username">
                {user?.profile?.firstName && user?.profile?.lastName 
                  ? `${user.profile.firstName} ${user.profile.lastName}`
                  : user?.email || "User"
                }
              </span>
            </div>
          </>
        )}
      </header>
      {isAuthenticated && (
        <>
          <aside className={`startup-sidebar${sidebarOpen ? " open" : ""}`}>
            <button
              className="startup-sidebar__close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              ×
            </button>
            <div className="startup-sidebar__logo">
              <img
                src="/assets/logo/LeanSprintNewLogo.png"
                alt="LeanSprint"
                className="startup-sidebar__logo-img"
              />
            </div>
            <div className="startup-sidebar__section">
              <div className="startup-sidebar__subtitle">MENU</div>
              <nav>
                <a href="/startup/dashboard" className="startup-sidebar__link">
                  <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.3333 3.07048V5.73714H16V3.07048H21.3333ZM8 3.07048V11.0705H2.66667V3.07048H8ZM21.3333 13.7371V21.7371H16V13.7371H21.3333ZM8 19.0705V21.7371H2.66667V19.0705H8ZM24 0.403809H13.3333V8.40381H24V0.403809ZM10.6667 0.403809H0V13.7371H10.6667V0.403809ZM24 11.0705H13.3333V24.4038H24V11.0705ZM10.6667 16.4038H0V24.4038H10.6667V16.4038Z" fill="currentColor"/>
                  </svg>
                  Dashboard
                </a>
              </nav>
            </div>
            <div className="startup-sidebar__section">
              <div className="startup-sidebar__subtitle">SUPPORT</div>
              <nav>
                <a href="#" className="startup-sidebar__link" onClick={handleChatClick}>
                  <svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.9987 29.7372C23.3625 29.7372 29.332 23.7677 29.332 16.4039C29.332 9.04009 23.3625 3.07056 15.9987 3.07056C8.6349 3.07056 2.66536 9.04009 2.66536 16.4039C2.66536 18.5368 3.16619 20.5527 4.05664 22.3405C4.29328 22.8156 4.37204 23.3586 4.23485 23.8714L3.44071 26.8394C3.09597 28.1279 4.27472 29.3066 5.56316 28.9619L8.53121 28.1677C9.04394 28.0305 9.58697 28.1093 10.0621 28.3459C11.8499 29.2364 13.8658 29.7372 15.9987 29.7372Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M10.668 14.4038H21.3346" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M10.668 19.0706H18.0013" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Chat
                </a>
              </nav>
            </div>
            <div className="startup-sidebar__section" style={{ marginTop: "auto" }}>
              <div className="startup-sidebar__subtitle">ACCOUNT</div>
              <nav>
                <button
                  className="startup-sidebar__link startup-sidebar__logout-btn"
                  onClick={handleLogout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: "inherit",
                    font: "inherit"
                  }}
                >
                  <Icon name="Logout" size={18} />
                  Logout
                </button>
              </nav>
            </div>
          </aside>
          {sidebarOpen && <div className="startup-sidebar__backdrop" onClick={() => setSidebarOpen(false)} />}
        </>
      )}
    </>
  );
};

export default StartupHeader;
