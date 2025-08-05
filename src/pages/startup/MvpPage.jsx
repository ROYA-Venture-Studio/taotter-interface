import { useNavigate } from 'react-router-dom'
import { Button, Icon } from '../../components/ui'
import './MvpPage.css'

import mvpImage from '../../assets/images/mvp.png'
import mvpDesktopImage from '../../assets/images/mvp-desktop.png'

const MvpPage = () => {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate('/mvp/form')
  }

  return (
    <div className="mvp-page">
      {/* Main Content Section */}
      <section className="mvp-hero-section">
        <div className="mvp-container">
          <div className="mvp-content">
            
            {/* Profile Image */}
            <div className="profile-image-container">
              <picture>
                <source
                  srcSet={mvpDesktopImage}
                  media="(min-width:1024px)"
                />
                <img src={mvpImage} alt="Taotter Expert" className="profile-image" />
              </picture>
            </div>

            {/* Content Area */}
            <div className="content-area">
              
              {/* Meet Taotter Badge */}
              <div className="badge-container">
                <div className="accent-line"></div>
                <div className="badge-text">
                  <span style={{ color: "#252525" }}>Meet Leansprintr</span>
                </div>
              </div>

              {/* Main Heading */}
<div className="main-heading">
  <h1>
    <span className="build-your">Build Your </span>
    <span className="startup-text" style={{ color: "#EB5E28" }}>Startup</span>
  </h1>
</div>

              {/* Subtitle */}
              <div className="subtitle-container">
                <p>Get your roadmap, Get your team. Launch your first sprint.</p>
              </div>

              {/* Feature Cards Container */}
              <div className="features-container">
                <div className="features-card">
                  
                  {/* Strategic Roadmap */}
                  <div className="feature-item">
                    <div className="feature-icon">
                      <Icon name="Chart" size={24} />
                    </div>
                    <div className="feature-content">
                      <div className="feature-text">
                        <h3>Strategic Roadmap</h3>
                        <p>Clear path to product-market fit.</p>
                      </div>
                    </div>
                  </div>

                  {/* Expert Team */}
                  <div className="feature-item">
                    <div className="feature-icon">
                      <Icon name="Users" size={24} />
                    </div>
                    <div className="feature-content">
                      <div className="feature-text">
                        <h3>Expert Team</h3>
                        <p>On-demand talent for your needs.</p>
                      </div>
                    </div>
                  </div>

                  {/* Sprint Launch */}
                  <div className="feature-item">
                    <div className="feature-icon">
                      <Icon name="Bolt" size={24} />
                    </div>
                    <div className="feature-content">
                      <div className="feature-text">
                        <h3>Sprint Launch</h3>
                        <p>From concept to MVP in weeks.</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Let's Start Button */}
              <div className="cta-button-container">
                <Button 
                  variant="primary" 
                  className="lets-start-btn"
                  style={{
                    background: "linear-gradient(90deg, #EB5E28 0%, #FFB347 100%)",
                    color: "#fff",
                    border: "none"
                  }}
                  onClick={handleGetStarted}
                >
                  Let's Start
                </Button>
              </div>

              {/* No Credit Card Required */}
              <div className="disclaimer-container">
                <p>No Credit card required</p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* WhatsApp Floating Button */}
      <div className="whatsapp-float">
        <div className="whatsapp-button">
          <div className="whatsapp-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M26.0314 5.92698C23.3783 3.27071 19.8498 1.80722 16.0908 1.80566C8.34492 1.80566 2.04091 8.10949 2.0378 15.8574C2.03676 18.3342 2.68378 20.7519 3.91359 22.883L1.91992 30.165L9.36962 28.2108C11.4223 29.3305 13.7333 29.9206 16.0851 29.9213H16.091C23.8359 29.9213 30.1406 23.6169 30.1436 15.8687C30.1451 12.1136 28.6848 8.58307 26.0314 5.92698ZM16.0908 27.548H16.0859C13.9901 27.5472 11.9347 26.9839 10.1411 25.9199L9.71477 25.6667L5.294 26.8264L6.47397 22.5163L6.19616 22.0744C5.02692 20.2147 4.4095 18.0652 4.41054 15.8583C4.41296 9.41842 9.6528 4.1791 16.0955 4.1791C19.2153 4.18014 22.148 5.39663 24.3531 7.60441C26.5583 9.8122 27.7721 12.7468 27.771 15.8678C27.7682 22.3082 22.5288 27.548 16.0908 27.548ZM22.4976 18.8001C22.1466 18.6243 20.4202 17.7751 20.0982 17.6577C19.7766 17.5406 19.5422 17.4822 19.3084 17.8336C19.0742 18.185 18.4014 18.976 18.1964 19.2102C17.9915 19.4446 17.7869 19.474 17.4357 19.2981C17.0845 19.1224 15.9532 18.7515 14.6119 17.5553C13.5681 16.6242 12.8635 15.4744 12.6585 15.123C12.4539 14.7713 12.6568 14.5996 12.8126 14.4064C13.1927 13.9344 13.5733 13.4395 13.6903 13.2053C13.8075 12.9709 13.7488 12.7658 13.6609 12.5901C13.5733 12.4144 12.8711 10.6861 12.5786 9.98287C12.2933 9.29846 12.0041 9.39089 11.7884 9.38016C11.5838 9.36995 11.3496 9.36787 11.1154 9.36787C10.8814 9.36787 10.501 9.45563 10.179 9.80735C9.85722 10.1589 8.95022 11.0082 8.95022 12.7366C8.95022 14.4649 10.2084 16.1345 10.3839 16.3689C10.5595 16.6033 12.86 20.1499 16.3823 21.6707C17.22 22.0328 17.874 22.2487 18.3841 22.4105C19.2253 22.6778 19.9905 22.64 20.5957 22.5497C21.2704 22.4488 22.6729 21.7001 22.9658 20.88C23.2583 20.0597 23.2583 19.3568 23.1704 19.2102C23.0828 19.0638 22.8486 18.976 22.4976 18.8001Z" fill="white" />
            </svg>
          </div>
          <div className="whatsapp-indicator"></div>
        </div>
      </div>
    </div>
  )
}

export default MvpPage
