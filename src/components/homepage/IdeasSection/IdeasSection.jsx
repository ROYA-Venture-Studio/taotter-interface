import React from "react";
import "./IdeasSection.css";
import ideasImg from "./ideas.png";

export default function IdeasSection() {
  return (
    <section className="ideas-section">
      <div className="ideas-container">
        <h2 className="ideas-title">
          <span className="ideas-title-main">Startup ideas are cheap.</span>
          <br className="ideas-title-break" />
          <span className="title-highlight ideas-title-highlight">Traction isn't.</span>
        </h2>
        <div className="ideas-content">
          <div className="ideas-text">
            <p className="ideas-description">
              Ideas are easy to start, but are harder to prove.
            </p>
            <p className="ideas-description">
              Most founders get stuck between planning and building.
            </p>
            <p className="ideas-description">
              That's where <span className="text-highlight">we come in.</span>
            </p>
          </div>
          <div className="ideas-image-container">
            <img
              src={ideasImg}
              alt="Ideas visual"
              className="ideas-image"
              width={596}
              height={602}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
