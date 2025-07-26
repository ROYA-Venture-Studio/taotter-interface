import React, { useState } from "react";
import "./StartupHeader.css";

const StartupHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="startup-header">
      {/* Left: Logo */}
      <a href="/" className="startup-header__logo">
        <img
          src="/assets/logo/leansprintr.png"
          alt="Leansprint"
          style={{ height: "32px", width: "190px", objectFit: "contain" }}
        />
      </a>
      {/* Hamburger for mobile */}
      <button
        className="startup-header__hamburger"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="startup-header__hamburger-bar" />
        <span className="startup-header__hamburger-bar" />
        <span className="startup-header__hamburger-bar" />
      </button>
      {/* Center: Links */}
      <nav className={`startup-header__nav${menuOpen ? " open" : ""}`}>
        <a href="/how-it-works" className="startup-header__link">
          How it Works
        </a>
        <span className="startup-header__divider">|</span>
        <a href="/who-its-for" className="startup-header__link">
          Who It's For
        </a>
      </nav>
      {/* Right: Button */}
      <button className={`startup-header__button${menuOpen ? " open" : ""}`}>
        <img
          src="/assets/icons/stars.svg"
          alt=""
          className="startup-header__icon"
          aria-hidden="true"
        />
        <span>Let's Start</span>
      </button>
    </header>
  );
};

export default StartupHeader;
