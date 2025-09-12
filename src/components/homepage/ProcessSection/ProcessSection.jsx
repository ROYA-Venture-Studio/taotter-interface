import React from "react";
import "./ProcessSection.css";
import processImg from "./process.png";
import processMobileImg from "./process-mobile.png";

function isMobile() {
  if (typeof window !== "undefined") {
    return window.innerWidth <= 768;
  }
  return false;
}

export default function ProcessSection() {
  const mobile = isMobile();

  return (
    <>
      <section className="process-section">
        <div className="process-container">
          {!mobile ? (
            <>
              <h2 className="process-title">
                From idea to MVP to traction —<br />
                <span className="title-highlight">without breaking the bank</span>
              </h2>
              <div className="process-image-row">
                <img
                  src={processImg}
                  alt="Process"
                  className="process-image"
                />
              </div>
            </>
          ) : (
            <div className="process-mobile">
              <h2 className="process-title-mobile">
                <span className="process-title-mobile-regular">From idea to</span><br />
                <span className="process-title-mobile-regular">MVP to traction —</span><br />
                <span className="process-title-mobile-highlight">without breaking the bank</span>
              </h2>
              <div style={{ height: "33px" }} />
              <div className="process-image-row-mobile">
                <img
                  src={processMobileImg}
                  alt="Process"
                  className="process-image-mobile"
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
