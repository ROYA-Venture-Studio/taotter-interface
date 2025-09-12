import React from "react";
import "./FooterSection.css";
import facebookIcon from "./facebook.png";
import twitterIcon from "./twitter.png";
import instagramIcon from "./instagram.png";
import youtubeIcon from "./youtube.png";

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
                <a href="#" className="footer-link">About us</a>
                <a href="#" className="footer-link">Talk to a Startup Specialist</a>
                <a href="#" className="footer-link">Contact Us</a>
              </div>
            </div>

            <div className="footer-column">
              <a href="#" className="footer-link">Privacy Policy</a>
              <a href="#" className="footer-link">Terms of Services</a>
              <a href="#" className="footer-link">Cookie Settings</a>
            </div>

            <div className="footer-column">
              <div className="follow-us">
                <p className="follow-title">Follow us</p>
                <div className="social-icons">
<a href="#" className="social-icon facebook">
  <img src={facebookIcon} alt="Facebook" width={40} height={40} />
</a>
<a href="#" className="social-icon twitter">
  <img src={twitterIcon} alt="Twitter" width={40} height={40} />
</a>
<a href="#" className="social-icon instagram">
  <img src={instagramIcon} alt="Instagram" width={40} height={40} />
</a>
<a href="#" className="social-icon youtube">
  <img src={youtubeIcon} alt="YouTube" width={40} height={40} />
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
