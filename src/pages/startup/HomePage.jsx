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
import bg1 from "../../assets/images/background/1.png";
import bg2 from "../../assets/images/background/2.png";
import bg3 from "../../assets/images/background/3.png";
import bg4 from "../../assets/images/background/4.png";
import bg5 from "../../assets/images/background/5.png";
import bg6 from "../../assets/images/background/6.png";
import bg7 from "../../assets/images/background/7.png";

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="leansprint-homepage">
      <Header />
      <HeroSection />
      <IdeasSection />
      {/* Image 1 between section 2 and 3 */}
      {/* <img src={bg1} alt="" className="homepage-bg-image homepage-bg-image-1" /> */}
      <AISolutionSection />
      {/* Image 2 in section 3 */}
      {/* <img src={bg2} alt="" className="homepage-bg-image homepage-bg-image-2" /> */}
      <SprintRecipesSection />
      {/* Image 3 in section 4 */}
      {/* <img src={bg3} alt="" className="homepage-bg-image homepage-bg-image-3" /> */}
      <ProcessSection />
      {/* Images 4 and 5 in section 5 */}
      {/* <img src={bg4} alt="" className=" homepage-bg-image-4" /> */}
      {/* <img src={bg5} alt="" className="homepage-bg-image homepage-bg-image-5" /> */}
      <MotionSection />
      <FoundersSection />
      <FinalCTASection />
      {/* Images 6 and 7 in FinalCTASection */}
      {/* <img src={bg6} alt="" className="homepage-bg-image homepage-bg-image-6" /> */}
      {/* <img src={bg7} alt="" className="homepage-bg-image homepage-bg-image-7" /> */}
      <SignupSection />
      <FooterSection />
    </div>
  );
}
