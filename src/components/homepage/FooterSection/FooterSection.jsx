import React from "react";
import "./FooterSection.css";
import facebookIcon from "./facebook.png";
import instagramIcon from "./instagram.png";
import linkedinIcon from "./linkedin.svg";

export default function FooterSection() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-logo">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/4a08691cfc429294e088240e9cf001e8a66679b9?width=400"
              alt="LeanSprintr"
              className="footer-logo-image"
            />
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <div className="footer-section">
                <a 
                  href="#process" 
                  className="footer-link"
                  onClick={(e) => {
                    e.preventDefault();
                    const section = document.querySelector('.process-section');
                    if (section) {
                      section.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  How it Works
                </a>
                <a 
                  href="#founders" 
                  className="footer-link"
                  onClick={(e) => {
                    e.preventDefault();
                    const section = document.querySelector('.founders-section');
                    if (section) {
                      section.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  Who's It For
                </a>
                <a href="https://leanstack.com/taotter/leansprintr" className="footer-link" target="_blank" rel="noopener noreferrer">Community</a>
              </div>
            </div>

            <div className="footer-column">
              <a href="#" className="footer-link">Privacy Policy</a>
              <a href="#" className="footer-link">Terms of Services</a>
            </div>

            <div className="footer-column">
              <div className="follow-us">
                <p className="follow-title">Follow us</p>
                <div className="social-icons">
                  <a href="https://www.facebook.com/profile.php?id=61580243300238" className="social-icon facebook" target="_blank" rel="noopener noreferrer">
                    <img src={facebookIcon} alt="Facebook" width={40} height={40} />
                  </a>
                  <a href="https://www.instagram.com/leansprintr" className="social-icon instagram" target="_blank" rel="noopener noreferrer">
                    <img src={instagramIcon} alt="Instagram" width={40} height={40} />
                  </a>
                  <a href="https://www.linkedin.com/showcase/leansprintr/about/" className="social-icon linkedin" target="_blank" rel="noopener noreferrer">
                    <img src={linkedinIcon} alt="LinkedIn" width={40} height={40} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-divider"></div>
          <div className="copyright">
            <p>© Leansprintr 2025. All Rights Reserved</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
