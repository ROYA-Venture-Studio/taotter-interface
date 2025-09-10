import React from "react";
import "./MotionSection.css";
import motionImg from "./motion.png";
import motionMobileImg from "./motion-mobile.png";

function isMobile() {
  if (typeof window !== "undefined") {
    return window.innerWidth <= 768;
  }
  return false;
}

export default function MotionSection() {
  const mobile = isMobile();

  return (
    <>
      <section className="motion-section">
        <div className="motion-container">
          {!mobile ? (
            <>
              <div className="motion-header">
                <div className="motion-subtitle">motion.</div>
                <h2 className="motion-title">
                  One platform. <span className="title-highlight">Everything in motion.</span>
                </h2>
                <p className="motion-description">
                  No more scattered tools (and efforts). Your business model, your milestones,
                  your dashboards, your remote team — all in one place.
                </p>
              </div>
              <div className="motion-image-row">
                <img
                  src={motionImg}
                  alt="Motion"
                  className="motion-image"
                />
              </div>
            </>
          ) : (
            <div className="motion-mobile">
              <h2 className="motion-title-mobile">
                <span style={{
                  fontSize: "30px",
                  fontWeight: 500,
                  color: "#fff"
                }}>One platform</span>
                <br />
                <span style={{
                  fontSize: "30px",
                  fontWeight: 700,
                  color: "#fff"
                }}>
                  Everything <span style={{
                    fontStyle: "italic",
                    color: "#F95738",
                    fontWeight: 700,
                    fontSize: "30px"
                  }}>in motion.</span>
                </span>
              </h2>
              <div style={{ height: "16px" }} />
              <p className="motion-description-mobile" style={{
                fontSize: "16px",
                fontWeight: 400,
                color: "#fff",
                margin: 0,
                textAlign: "center"
              }}>
                No more scattered tools (and efforts). Your business model, your milestones,
                your dashboards, your remote team — all in one place.
              </p>
              <div className="motion-image-row-mobile">
                <img
                  src={motionMobileImg}
                  alt="Motion"
                  className="motion-image-mobile"
                  width={408}
                  height={513}
                  style={{ width: "408px", height: "513px", objectFit: "contain" }}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
