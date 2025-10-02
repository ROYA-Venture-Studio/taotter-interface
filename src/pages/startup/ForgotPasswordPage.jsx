import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Icon } from "../../components/ui";
import authImage from "../../assets/images/form.png";
import leanSprintLogo from "../../assets/logo/LeanSprintNewLogo.png";
import "./ForgotPasswordPage.css";
import { useStartupForgotPasswordMutation } from "../../store/api/authApi";

// Mobile detection hook
function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  );
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= breakpoint);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);
  return isMobile;
}

const ForgotPasswordPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [forgotPassword, { isLoading }] = useStartupForgotPasswordMutation();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!email.trim()) {
      setErrors({ email: "Email is required" });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    try {
      await forgotPassword(email).unwrap();
      setIsSubmitted(true);
      // Store email for the next step
      localStorage.setItem('resetEmail', email);
    } catch (error) {
      console.error("Forgot password error:", error);
      setErrors({ 
        email: error.data?.message || "Failed to send reset code. Please try again." 
      });
    }
  };

  const handleContinue = () => {
    navigate('/reset-password');
  };

  if (isSubmitted) {
    return (
      <div className="forgot-password-page">
        {/* Mobile Header */}
        <div className="forgot-password-mobile-header">
          <img src={leanSprintLogo} alt="LeanSprint" className="forgot-password-mobile-logo" />
        </div>

        {/* Desktop Header */}
        <div className="forgot-password-desktop-header">
          <img src={leanSprintLogo} alt="LeanSprint" className="forgot-password-desktop-logo" />
        </div>

        <div className="forgot-password-container">
          <div className="forgot-password-form-container">
            <div className="forgot-password-form-title">Check Your Email</div>
            <div className="forgot-password-form-subtitle">
              We've sent a 6-digit verification code to <strong>{email}</strong>
            </div>
            
            <div className="success-message">
              <Icon name="check-circle" className="success-icon" />
              <p>Please check your email and follow the instructions to reset your password.</p>
              <p>The code will expire in 10 minutes.</p>
            </div>

            <button
              onClick={handleContinue}
              className="forgot-password-continue-btn"
            >
              Continue to Reset Password
            </button>

            <div className="forgot-password-back-link">
              <Link to="/startup/login">← Back to Login</Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="forgot-password-form-footer">
          <span className="forgot-password-form-footer-left">© Leansprintr by Taotter. All Rights Reserved.</span>
          <span className="forgot-password-form-footer-right">Terms of Services</span>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      {/* Mobile Layout */}
      {isMobile ? (
        <>
          {/* Mobile Header */}
          <div className="forgot-password-mobile-header">
            <img src={leanSprintLogo} alt="LeanSprint" className="forgot-password-mobile-logo" />
          </div>

          <div className="forgot-password-container">
            <div className="forgot-password-form-container">
              <div className="forgot-password-form-title">Forgot Password?</div>
              <div className="forgot-password-form-subtitle">
                Enter your email address and we'll send you a code to reset your password
              </div>
              
              <form onSubmit={handleSubmit} className="forgot-password-form">
                <div className="forgot-password-form-field">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={errors.email ? "error" : ""}
                  />
                  {errors.email && (
                    <div className="error-message">{errors.email}</div>
                  )}
                </div>

                <button
                  type="submit"
                  className="forgot-password-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Code"}
                </button>
              </form>

              <div className="forgot-password-back-link">
                <Link to="/startup/login">← Back to Login</Link>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Desktop Layout */
        <>
          {/* Desktop Header */}
          <div className="forgot-password-desktop-header">
            <img src={leanSprintLogo} alt="LeanSprint" className="forgot-password-desktop-logo" />
          </div>

          <div className="forgot-password-container">
            <div className="forgot-password-content">
              <div className="forgot-password-image-container">
                <img src={authImage} alt="Forgot Password" className="forgot-password-image" />
              </div>
              
              <div className="forgot-password-form-container">
                <div className="forgot-password-form-title">Forgot Password?</div>
                <div className="forgot-password-form-subtitle">
                  Enter your email address and we'll send you a code to reset your password
                </div>
                
                <form onSubmit={handleSubmit} className="forgot-password-form">
                  <div className="forgot-password-form-field">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className={errors.email ? "error" : ""}
                    />
                    {errors.email && (
                      <div className="error-message">{errors.email}</div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="forgot-password-submit-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Reset Code"}
                  </button>
                </form>

                <div className="forgot-password-back-link">
                  <Link to="/startup/login">← Back to Login</Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="forgot-password-form-footer">
        <span className="forgot-password-form-footer-left">© Leansprintr by Taotter. All Rights Reserved.</span>
        <span className="forgot-password-form-footer-right">Terms of Services</span>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;