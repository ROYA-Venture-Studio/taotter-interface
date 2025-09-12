import React from "react";
import "./Header.css";
import leansprintrLogo from "./leansprintr.png";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  return (
    <header className="homepage-header">
      <div className="homepage-header-container">
        <div className="homepage-logo">
          <img 
            src={leansprintrLogo}
            alt="LeanSprintr" 
            className="homepage-logo-image"
          />
        </div>
        <nav className="homepage-nav">

<button
  className="homepage-nav-link"
  onClick={() => navigate("/startup/login")}
>
  Login
</button>
          <button className="homepage-nav-button">Join the Community</button>
        </nav>
      </div>
    </header>
  );
}

// Existing export remains unchanged
