import React from "react";
import "./AISolutionSection.css";
import puzzleImg from "./puzzle.png";
import aiImg from "./ai.png";

export default function AISolutionSection() {
  return (
    <section className="ai-solution-section">
      <div className="solution-container">
        <h2 className="solution-title">
          Startup ideas are cheap.<br />
          <span className="title-highlight">Traction isn't.</span>
        </h2>
        {/* Images row, 48px below title */}
        <div className="solution-images-row">
          <img src={puzzleImg} alt="Puzzle" className="solution-image" />
          <img src={aiImg} alt="AI" className="solution-image" />
        </div>
      </div>
    </section>
  );
}
