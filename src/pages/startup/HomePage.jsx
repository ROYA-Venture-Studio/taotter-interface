import { useState } from "react";
import "./HomePage.css";
import Header from "../../components/homepage/Header/Header";
import HeroSection from "../../components/homepage/HeroSection/HeroSection";
import IdeasSection from "../../components/homepage/IdeasSection/IdeasSection";
import AISolutionSection from "../../components/homepage/AISolutionSection/AISolutionSection";
import SprintRecipesSection from "../../components/homepage/SprintRecipesSection/SprintRecipesSection";
import ProcessSection from "../../components/homepage/ProcessSection/ProcessSection";
import MotionSection from "../../components/homepage/MotionSection/MotionSection";
import FoundersSection from "../../components/homepage/FoundersSection/FoundersSection";
import FinalCTASection from "../../components/homepage/FinalCTASection/FinalCTASection";
import SignupSection from "../../components/homepage/SignupSection/SignupSection";
import FooterSection from "../../components/homepage/FooterSection/FooterSection";

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="leansprint-homepage">
      <Header />
      <HeroSection />
      <IdeasSection />
      <AISolutionSection />
      <SprintRecipesSection />
      <ProcessSection />
      <MotionSection />
      <FoundersSection />
      <FinalCTASection />
      {/* <SignupSection /> */}
      <FooterSection />
    </div>
  );
}
