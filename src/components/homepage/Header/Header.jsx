import React from "react";
import "./Header.css";
import leansprintrLogo from "./leansprintr.png";

export default function Header() {
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
          <button className="homepage-nav-link">Login</button>
          <button className="homepage-nav-button">Join the Community</button>
        </nav>
      </div>
    </header>
  );
}

// Existing export remains unchanged
