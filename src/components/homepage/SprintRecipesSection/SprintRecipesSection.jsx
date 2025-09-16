import React, { useRef, useEffect, useState } from "react";
import "./SprintRecipesSection.css";
import recipesImg from "./recipes.png";
import recipesMobileImg from "./recipes-mobile.png";
import bg3 from "../../../assets/images/background/3.png";

export default function SprintRecipesSection() {
  // Use window.innerWidth for SSR-safe mobile detection
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  // Fade-in animation logic
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log('SprintRecipes intersection:', entry.isIntersecting);
        if (entry.isIntersecting) {
          setIsVisible(true);
          console.log('SprintRecipes animation triggered');
        }
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  console.log('SprintRecipes isVisible:', isVisible);

  return (
    <section ref={sectionRef} className="sprint-recipes-section">
      {/* Background images */}
      <div className="sprint-recipes-background-images">
        <img src={bg3} alt="" className="sprint-recipes-bg-image sprint-recipes-bg-3" />
      </div>
      <div className="sprint-recipes-container">
        {isMobile ? (
          <>
            <h2 className="sprint-recipes-title">
              <span className="recipes-title-line">Sprint recipes built from</span><br />
              <span className="recipes-title-line recipes-title-highlight">real startup data</span><br />
              <span className="recipes-title-line">
                not <span className="recipes-title-italic">consultant stories</span>
              </span>
            </h2>
            <div className="recipes-image-row">
              <img
                src={recipesMobileImg}
                alt="Sprint Recipes Mobile"
                className={`recipes-image recipes-image-mobile${isVisible ? " fade-in" : ""}`}
                width={365}
                height={792}
              />
            </div>
            <div className="platform-statement">
              <p className="platform-statement-text">
                We aren't selling decks or playbooks.<br />
                LeanSprintr is a <span className="highlight-platform">platform</span><br />
                that builds with you.
              </p>
            </div>
          </>
        ) : (
          <>
            <h2 className="sprint-recipes-title">
              Sprint recipes built from<br />
              <span className="title-highlight">real startup data,</span><br />
              not consultant stories
            </h2>
            <div className="recipes-image-row">
              <img
                src={recipesImg}
                alt="Sprint Recipes"
                className={`recipes-image${isVisible ? " fade-in" : ""}`}
              />
            </div>
            <div className="platform-statement">
              <p>
                We aren't selling decks or playbooks.<br />
                LeanSprintr is a <span className="highlight-platform">platform</span> that builds with you.
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
