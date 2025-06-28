import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./StartupHeader.css";
import MenuFriesLeft from "../../../assets/icons/menu-fries-left.svg";
import TaotterBlueLogo from "../../../assets/logo/Taotter_blue_logo.png";
import LogoutIcon from "../../../assets/icons/Logout.svg";
import SidebarChatList from "../SidebarChatList/SidebarChatList";
import { logout } from "../../../store/slices/authSlice";

const CHAT_ANIMATION_DURATION = 300;

const StartupHeader = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatClosing, setChatClosing] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleChatClick = (e) => {
    e.preventDefault();
    setSidebarOpen(false);
    setChatOpen(true);
    setChatClosing(false);
  };

  const handleChatClose = () => {
    setChatClosing(true);
    setTimeout(() => {
      setChatOpen(false);
      setChatClosing(false);
    }, CHAT_ANIMATION_DURATION);
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
          <button
            className="startup-header__menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <img
              src={MenuFriesLeft}
              alt="Menu"
              className="startup-header__menu-icon"
            />
          </button>
        )}
        <div className="startup-header__logo-center">
          <img
            src={TaotterBlueLogo}
            alt="Taotter"
            className="startup-header__logo-img"
          />
        </div>
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
            <div className="startup-sidebar__section">
              <div className="startup-sidebar__subtitle">MENU</div>
              <nav>
                <a href="/startup/dashboard" className="startup-sidebar__link">Dashboard</a>
                {/* <a href="/boards" className="startup-sidebar__link">Board</a> */}
              </nav>
            </div>
            <div className="startup-sidebar__section">
              <div className="startup-sidebar__subtitle">SUPPORT</div>
              <nav>
                <a href="#" className="startup-sidebar__link" onClick={handleChatClick}>Chat</a>
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
                  <img src={LogoutIcon} alt="Logout" style={{ width: 18, height: 18 }} />
                  Logout
                </button>
              </nav>
            </div>
          </aside>
          {sidebarOpen && <div className="startup-sidebar__backdrop" onClick={() => setSidebarOpen(false)} />}
          {(chatOpen || chatClosing) && (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              zIndex: 3000,
              width: "100vw",
              height: "100vh",
              background: "rgba(52,64,84,0.10)",
              display: "flex",
              alignItems: "flex-start"
            }}>
              <div style={{ height: "100vh" }}>
                <SidebarChatList onClose={handleChatClose} isClosing={chatClosing} />
              </div>
              <div
                style={{
                  flex: 1,
                  height: "100vh",
                  cursor: "pointer"
                }}
                onClick={handleChatClose}
              />
            </div>
          )}
        </>
      )}
    </>
  );
};

export default StartupHeader;
