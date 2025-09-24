import React from "react";
import "./FoundersSection.css";
import laptopImg from "./laptop.png";
import testingImg from "./testing.png";
import validatingImg from "./validating.png";
import buildingImg from "./building.png";
import lookingImg from "./looking.png";
import tickIcon from "./tick.png";
import megaphoneIcon from "./megaphone.png";

export default function FoundersSection() {
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  return (
    <section className="founders-section">
      <div className="founders-container">
        {!isMobile ? (
          <>
            <div className="founders-text">
              <h2 className="founders-title right-align">
                Built for founders who want
                <br />
                <span className="title-highlight">
                  <img src={tickIcon} alt="Check icon" className="inline-icon" />
                  proof
                </span>{" "}
                <span className="founders-subtitle">without the</span>{" "}
                <span className="founders-accent">
                  <img src={megaphoneIcon} alt="Noise icon" className="inline-icon megaphone-icon" />
                  noise
                </span>
              </h2>
            </div>
            <div className="founders-images-row">
              <img
                src={laptopImg}
                alt="LeanSprintr Dashboard on Laptop"
                className="laptop-image"
                width={580}
                height={580}
              />
              <div className="founder-types-grid">
                <div className="founder-type-card">
                  <img src={testingImg} alt="Testing Founder" />
                </div>
                <div className="founder-type-card">
                  <img src={validatingImg} alt="Validating Founder" />
                </div>
                <div className="founder-type-card">
                  <img src={buildingImg} alt="Building Founder" />
                </div>
                <div className="founder-type-card">
                  <img src={lookingImg} alt="Looking Founder" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="founders-mobile">
            <h2 className="founders-title-mobile" style={{
              fontSize: "30px",
              fontWeight: 500,
              color: "#fff",
              lineHeight: "1.15",
              marginBottom: 0,
              textAlign: "center"
            }}>
              Built for founders who want
              <br />
              <span>
                <img src={tickIcon} alt="Check icon" className="inline-icon" />
                proof
              </span>{" "}
              <span className="founders-subtitle-mobile" style={{ color: "#C8C8C8" }}>without the</span>{" "}
              <span className="founders-accent-mobile" style={{ color: "#1986CA" }}>
                <img src={megaphoneIcon} alt="Noise icon" className="inline-icon megaphone-icon" />
                noise
              </span>
            </h2>
            <div style={{ height: "16px" }} />
            <div className="founders-images-row-mobile">
              <img
                src={laptopImg}
                alt="LeanSprintr Dashboard on Laptop"
                className="laptop-image-mobile"
                width={300}
                height={300}
                style={{ width: "300px", height: "300px", objectFit: "contain" }}
              />
              <div style={{ height: "48px" }} />
              <div className="founder-types-grid">
                <div className="founder-type-card">
                  <img src={testingImg} alt="Testing Founder" />
                </div>
                <div className="founder-type-card">
                  <img src={validatingImg} alt="Validating Founder" />
                </div>
                <div className="founder-type-card">
                  <img src={buildingImg} alt="Building Founder" />
                </div>
                <div className="founder-type-card">
                  <img src={lookingImg} alt="Looking Founder" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
