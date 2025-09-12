import React from "react";
import "./FoundersSection.css";
import laptopImg from "./laptop.png";
import foundertypesImg from "./foundertypes.png";
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
                  <img src={megaphoneIcon} alt="Noise icon" className="inline-icon" />
                  noise
                </span>
              </h2>
            </div>
            <div className="founders-images-row">
              <img
                src={laptopImg}
                alt="LeanSprintr Dashboard on Laptop"
                className="laptop-image"
                width={660}
                height={660}
              />
              <img
                src={foundertypesImg}
                alt="Founder Types"
                className="foundertypes-image"
                width={525}
                height={514}
              />
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
                <img src={megaphoneIcon} alt="Noise icon" className="inline-icon" />
                noise
              </span>
            </h2>
            <div style={{ height: "16px" }} />
            <div className="founders-images-row-mobile">
              <img
                src={laptopImg}
                alt="LeanSprintr Dashboard on Laptop"
                className="laptop-image-mobile"
                width={378}
                height={378}
                style={{ width: "378px", height: "378px", objectFit: "contain" }}
              />
              <div style={{ height: "48px" }} />
              <img
                src={foundertypesImg}
                alt="Founder Types"
                className="foundertypes-image-mobile"
                width={410}
                height={401}
                style={{ width: "410px", height: "401px", objectFit: "contain" }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
