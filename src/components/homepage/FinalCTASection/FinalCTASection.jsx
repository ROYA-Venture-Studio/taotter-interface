import React from "react";
import "./FinalCTASection.css";
import phoneImg from "./phone.png";
import circleImg from "./circle.png";

function isMobile() {
  if (typeof window !== "undefined") {
    return window.innerWidth <= 768;
  }
  return false;
}

export default function FinalCTASectionSimple() {
  const mobile = isMobile();

  return (
    <section className="final-cta-section simple">
      <div className="final-cta-container simple">
        {!mobile ? (
          <div className="cta-content simple">
            <div className="cta-text">
              <div className="cta-icon-wrapper">
{/* <img
  src={circleImg}
  alt="Circle highlight"
  className="cta-circle-desktop"
/> */}
              </div>
              <h2 className="final-cta-title">
                Ready to go from <span className="title-bold">idea</span><br />
                to meaningful traction?
              </h2>
              <div className="final-cta-buttons">
                <button className="cta-primary">Start Your Sprint</button>
                <button className="cta-secondary">
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/3886e0f9f8638bd8b6162b1080583dec2050d482?width=48"
                    alt="Play icon"
                    className="play-icon"
                  />
                  Watch the Demo
                </button>
              </div>
            </div>
<img
  src={phoneImg}
  alt="Phone mockup"
  className="phone-image-simple"
  width={463}
  height={626}
/>
          </div>
        ) : (
          <div className="cta-content-mobile">
<div className="cta-text-mobile">
<div className="cta-circle-mobile-wrapper">
{/* <img
  src={circleImg}
  alt="Circle highlight"
  className="cta-circle-mobile"
/> */}
              </div>
<h2 className="final-cta-title-mobile">
  Ready to go from <span>idea</span>
  <br />
  to meaningful traction?
</h2>
<div className="cta-spacing-43" />
<div className="final-cta-buttons-mobile">
                <button className="cta-primary-mobile">Start Your Sprint</button>
                <button className="cta-secondary-mobile">
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/3886e0f9f8638bd8b6162b1080583dec2050d482?width=48"
                    alt="Play icon"
                    className="play-icon"
                  />
                  Watch the Demo
                </button>
              </div>
<div className="cta-spacing-24" />
<img
  src={phoneImg}
  alt="Phone mockup"
  className="phone-image-mobile"
  width={300}
  height={405}
/>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
