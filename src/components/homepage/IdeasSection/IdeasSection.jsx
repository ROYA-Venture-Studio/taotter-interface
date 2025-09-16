import React, { useEffect, useRef, useState } from "react";
import "./IdeasSection.css";
import ideasImg from "./ideas.png";
import bg1 from "../../../assets/images/background/1.png";
import bg2 from "../../../assets/images/background/2.png";

export default function IdeasSection() {
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
    <section className="ideas-section" ref={sectionRef}>
      {/* Background images */}
      <div className="ideas-background-images">
        <img src={bg1} alt="" className="ideas-bg-image ideas-bg-1" />
        <img src={bg2} alt="" className="ideas-bg-image ideas-bg-2" />
      </div>
      <div className="ideas-container">
        <h2 className="ideas-title">
          <span className="ideas-title-main">Startup ideas are cheap.</span>
          <br className="ideas-title-break" />
          <span className="title-highlight ideas-title-highlight">Traction isn't.</span>
        </h2>
        <div className="ideas-content">
          <div className={`ideas-text ${isVisible ? 'animate' : ''}`}>
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
          <div className={`ideas-image-container ${isVisible ? 'animate' : ''}`}>
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
