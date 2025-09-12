import React from "react";
import "./HeroSection.css";
import boardImg from "./board.png";
import backgroundImg from "./background.png";
import milestonesImg from "./milestones.png";
import sprintprogressImg from "./sprintprogress.png";

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="main-content-container">
          <h1 className="hero-title">
            Launch Your Startup From<br />
            <span className="title-highlight">Idea to First Customers</span>
          </h1>
          <p className="hero-description">
            LeanSprintr gets you from zero to traction with a roadmap, a real team,
            and execution sprints built for fundraising momentum.
          </p>
          <div className="hero-cta">
            <button className="cta-primary">Start Your Sprint</button>
            <button className="cta-secondary">
              <svg className="play-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M8 5v14l11-7z" fill="currentColor"/>
              </svg>
              Watch the Demo
            </button>
          </div>
        </div>
        {/* Sprint Progress always rendered, layout controlled by CSS */}
        <img
          src={sprintprogressImg}
          alt="Sprint Progress"
          className="sprintprogress-bg-img"
        />
        <div className="board-image-container">
          <img
            src={boardImg}
            alt="Board"
            className="board-image"
          />
        </div>
        {/* Responsive/absolute background overlays */}
        <img
          src={backgroundImg}
          alt="Background"
          className="hero-bg-img"
        />
        <img
          src={milestonesImg}
          alt="Milestones"
          className="milestones-bg-img"
        />
      </div>
      {/* Background Elements */}
      <div className="hero-bg-elements">
        <img 
          src="https://api.builder.io/api/v1/image/assets/TEMP/ddb8284b0c56dec1bdd2c1c68c470722fef325c3?width=1616" 
          alt="" 
          className="hero-bg-1"
        />
      </div>
    </section>
  );
}
