import React from "react";
import "./SprintRecipesSection.css";
import recipesImg from "./recipes.png";
import recipesMobileImg from "./recipes-mobile.png";

export default function SprintRecipesSection() {
  // Use window.innerWidth for SSR-safe mobile detection
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  return (
    <section className="sprint-recipes-section">
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
                className="recipes-image recipes-image-mobile"
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
                className="recipes-image"
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
