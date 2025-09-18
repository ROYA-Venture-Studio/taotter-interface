import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FinalCTASection.css";
import phoneImg from "./phone.png";
import circleImg from "./circle.svg";
import bg6 from "../../../assets/images/background/6.png";
import bg7 from "../../../assets/images/background/7.png";

function isMobile() {
  if (typeof window !== "undefined") {
    return window.innerWidth <= 768;
  }
  return false;
}

export default function FinalCTASectionSimple() {
  const navigate = useNavigate();
  const mobile = isMobile();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section className="final-cta-section simple" ref={sectionRef}>
      {/* Background images */}
      <div className="final-cta-background-images">
        <img src={bg6} alt="" className="final-cta-bg-image final-cta-bg-6" />
        <img src={bg7} alt="" className="final-cta-bg-image final-cta-bg-7" />
      </div>
      <div className="final-cta-container simple">
        {!mobile ? (
          <div className="cta-content simple">
            <div className="cta-text">
              <h2 className="final-cta-title">
                Ready to go from <span className="title-bold cta-idea-word">
                  idea
                  <img 
                    src={circleImg} 
                    alt="Circle highlight" 
                    className={`cta-circle-desktop ${isVisible ? 'animate' : ''}`} 
                  />
                </span><br />
                to meaningful traction?
              </h2>
              <div className="final-cta-buttons">
                <button 
                  className="cta-primary"
                  onClick={() => navigate("/mvp/form")}
                >
                  Start Your Sprint
                </button>
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
    className={`phone-image-simple${isVisible ? ' animate' : ''}`}
    width={463}
    height={626}
  />
          </div>
        ) : (
          <div className="cta-content-mobile">
<div className="cta-text-mobile">
<div className="cta-circle-mobile-wrapper">
              </div>
<h2 className="final-cta-title-mobile">
  Ready to go from <span className="cta-idea-word-mobile">
    idea
    <img 
      src={circleImg} 
      alt="Circle highlight" 
      className={`cta-circle-mobile ${isVisible ? 'animate' : ''}`} 
    />
  </span>
  <br />
  to meaningful traction?
</h2>
<div className="cta-spacing-43" />
<div className="final-cta-buttons-mobile">
                <button 
                  className="cta-primary-mobile"
                  onClick={() => navigate("/mvp/form")}
                >
                  Start Your Sprint
                </button>
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
  className={`phone-image-mobile${isVisible ? ' animate' : ''}`}
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
