import React, { useState, useEffect, useRef } from "react";
import "./ProcessSection.css";
import process1 from "./process1.svg";
import process2 from "./process2.svg";
import process3 from "./process3.svg";
import bg4 from "../../../assets/images/background/3.png";
import bg5 from "../../../assets/images/background/5.png";

const CLONE_COUNT = 1;

export default function ProcessSection() {
  const originalItems = [
    { src: process1, alt: "Process Card 1" },
    { src: process2, alt: "Process Card 2" },
    { src: process3, alt: "Process Card 3" },
  ];

  const [loopedItems, setLoopedItems] = useState([]);
  const carouselRef = useRef(null);
  const trackRef = useRef(null);
  const isJumping = useRef(false);

  useEffect(() => {
    const clonesStart = originalItems.slice(-CLONE_COUNT);
    const clonesEnd = originalItems.slice(0, CLONE_COUNT);
    setLoopedItems([...clonesStart, ...originalItems, ...clonesEnd]);
  }, []);

  useEffect(() => {
    if (!carouselRef.current || !trackRef.current || loopedItems.length === 0) {
      return;
    }

    const carousel = carouselRef.current;
    const track = trackRef.current;

    const card = track.children[0];
    if (!card) return;

    const cardWidth = card.offsetWidth;
    const gap = parseInt(window.getComputedStyle(track).gap, 10) || 32;
    const singleItemWidth = cardWidth + gap;

    const initialScrollLeft = singleItemWidth * CLONE_COUNT;
    carousel.scrollLeft = initialScrollLeft;

    const handleScroll = () => {
      if (isJumping.current) return;

      const { scrollLeft, clientWidth, scrollWidth } = carousel;

      // ==================================================================
      // THE FIX IS HERE 👇
      // This is a more reliable way to check for the end of the scroll.
      // It checks if the scrolled distance + visible width is at the end.
      // A 1px buffer is added to prevent rounding errors.
      if (scrollLeft + clientWidth >= scrollWidth - 1) {
      // ==================================================================
        isJumping.current = true;
        carousel.classList.add("no-scroll-transition");
        carousel.scrollLeft = initialScrollLeft;
      }

      if (scrollLeft <= 0) {
        isJumping.current = true;
        carousel.classList.add("no-scroll-transition");
        carousel.scrollLeft = singleItemWidth * originalItems.length;
      }
    };

    const handleTransitionEnd = () => {
        isJumping.current = false;
        carousel.classList.remove("no-scroll-transition");
    };

    carousel.addEventListener("scroll", handleScroll);
    carousel.addEventListener("transitionend", handleTransitionEnd);

    const scrollTimeout = setInterval(() => {
        if (isJumping.current) {
            isJumping.current = false;
            carousel.classList.remove("no-scroll-transition");
        }
    }, 200);

    return () => {
      carousel.removeEventListener("scroll", handleScroll);
      carousel.removeEventListener("transitionend", handleTransitionEnd);
      clearInterval(scrollTimeout);
    };
  }, [loopedItems, originalItems.length]);

  // ... the rest of your return statement is unchanged ...
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
            <div ref={trackRef} className="carousel-track">
              {loopedItems.map((item, index) => (
                <img key={index} src={item.src} alt={item.alt} className="process-card-img" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}