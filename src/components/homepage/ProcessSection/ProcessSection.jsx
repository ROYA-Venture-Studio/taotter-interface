import React, { useEffect, useRef } from "react";
import "./ProcessSection.css";
import process1 from "./process1.svg";
import process2 from "./process2.svg";
import process3 from "./process3.svg";
import bg4 from "../../../assets/images/background/3.png";
import bg5 from "../../../assets/images/background/5.png";

export default function ProcessSection() {
  const originalItems = [
    { src: process1, alt: "Process Card 1" },
    { src: process2, alt: "Process Card 2" },
    { src: process3, alt: "Process Card 3" },
  ];

  const carouselRef = useRef(null);

  useEffect(() => {
    // Ensure the carousel starts at the beginning (first card)
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = 0;
    }
  }, []);

  return (
    <section className="process-section">
      {/* Background images */}
      <div className="process-background-images">
        <img src={bg4} alt="" className="process-bg-image process-bg-4" />
        <img src={bg5} alt="" className="process-bg-image process-bg-5" />
      </div>
      <div className="process-container">
        <div className="process-desktop">
          <h2 className="process-title">
            From idea to MVP to traction —<br />
            <span className="title-highlight">without breaking the bank</span>
          </h2>
          <div className="process-image-row">
            {originalItems.map((item, index) => (
              <img key={index} src={item.src} alt={item.alt} className="process-card-img" />
            ))}
          </div>
        </div>
        <div className="process-mobile">
          <h2 className="process-title-mobile">
            <span className="process-title-mobile-regular">From idea to</span><br />
            <span className="process-title-mobile-regular">MVP to traction —</span><br />
            <span className="process-title-mobile-highlight">without breaking the bank</span>
          </h2>
          <div style={{ height: "33px" }} />
          <div ref={carouselRef} className="process-carousel">
            <div className="carousel-track">
              {originalItems.map((item, index) => (
                <img key={index} src={item.src} alt={item.alt} className="process-card-img" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}