import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Icon } from "../../components/ui";
import authImage from "../../assets/images/form.png";
import leanSprintLogo from "../../assets/logo/LeanSprintNewLogo.png";
import "./ResetPasswordPage.css";
import { 
  useVerifyResetCodeMutation, 
  useStartupResetPasswordMutation 
} from "../../store/api/authApi";

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

const ResetPasswordPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [verifyResetCode, { isLoading: isVerifying }] = useVerifyResetCodeMutation();
  const [resetPassword, { isLoading: isResetting }] = useStartupResetPasswordMutation();
  
  const [step, setStep] = useState(1); // 1: verify code, 2: set new password, 3: success
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Get email from localStorage if available
    const savedEmail = localStorage.getItem('resetEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
    } else {
      // Redirect to forgot password if no email
      navigate('/forgot-password');
    }
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateCode = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }
    
    if (!formData.code.trim()) {
      newErrors.code = "Verification code is required";
    } else if (formData.code.length !== 6 || !/^\d+$/.test(formData.code)) {
      newErrors.code = "Please enter a valid 6-digit code";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!validateCode()) return;

    try {
      await verifyResetCode({
        email: formData.email,
        code: formData.code
      }).unwrap();
      setStep(2);
    } catch (error) {
      console.error("Code verification error:", error);
      setErrors({ 
        code: error.data?.message || "Invalid or expired code. Please try again." 
      });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    try {
      await resetPassword({
        email: formData.email,
        code: formData.code,
        newPassword: formData.newPassword
      }).unwrap();
      
      // Clear saved email
      localStorage.removeItem('resetEmail');
      setStep(3);
    } catch (error) {
      console.error("Password reset error:", error);
      setErrors({ 
        newPassword: error.data?.message || "Failed to reset password. Please try again." 
      });
    }
  };

  const handleBackToLogin = () => {
    localStorage.removeItem('resetEmail');
    navigate('/startup/login');
  };

  const renderStep1 = () => (
    <div className="reset-password-form-container">
      <div className="reset-password-form-title">Enter Verification Code</div>
      <div className="reset-password-form-subtitle">
        Enter the 6-digit code we sent to <strong>{formData.email}</strong>
      </div>
      
      <form onSubmit={handleVerifyCode} className="reset-password-form">
        <div className="reset-password-form-field">
          <label htmlFor="code">Verification Code</label>
          <input
            type="text"
            id="code"
            value={formData.code}
            onChange={(e) => handleInputChange('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit code"
            className={errors.code ? "error" : ""}
            maxLength={6}
          />
          {errors.code && (
            <div className="error-message">{errors.code}</div>
          )}
        </div>

        <button
          type="submit"
          className="reset-password-submit-btn"
          disabled={isVerifying}
        >
          {isVerifying ? "Verifying..." : "Verify Code"}
        </button>
      </form>

      <div className="reset-password-back-link">
        <Link to="/forgot-password">← Back to Email Entry</Link>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="reset-password-form-container">
      <div className="reset-password-form-title">Set New Password</div>
      <div className="reset-password-form-subtitle">
        Create a new password for your account
      </div>
      
      <form onSubmit={handleResetPassword} className="reset-password-form">
        <div className="reset-password-form-field">
          <label htmlFor="newPassword">New Password</label>
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              id="newPassword"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              placeholder="Enter new password"
              className={errors.newPassword ? "error" : ""}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              <Icon name={showPassword ? "eye-off" : "eye"} />
            </button>
          </div>
          {errors.newPassword && (
            <div className="error-message">{errors.newPassword}</div>
          )}
        </div>

        <div className="reset-password-form-field">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <div className="password-input-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Confirm new password"
              className={errors.confirmPassword ? "error" : ""}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Icon name={showConfirmPassword ? "eye-off" : "eye"} />
            </button>
          </div>
          {errors.confirmPassword && (
            <div className="error-message">{errors.confirmPassword}</div>
          )}
        </div>

        <button
          type="submit"
          className="reset-password-submit-btn"
          disabled={isResetting}
        >
          {isResetting ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <div className="reset-password-back-link">
        <button onClick={() => setStep(1)} className="back-button">
          ← Back to Code Entry
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="reset-password-form-container">
      <div className="reset-password-form-title">Password Reset Successful!</div>
      <div className="reset-password-form-subtitle">
        Your password has been successfully updated
      </div>
      
      <div className="success-message">
        <Icon name="check-circle" className="success-icon" />
        <p>Your password has been reset successfully!</p>
        <p>You can now log in with your new password.</p>
      </div>

      <button
        onClick={handleBackToLogin}
        className="reset-password-submit-btn"
      >
        Back to Login
      </button>
    </div>
  );

  return (
    <div className="reset-password-page">
      {/* Mobile Layout */}
      {isMobile ? (
        <>
          {/* Mobile Header */}
          <div className="reset-password-mobile-header">
            <img src={leanSprintLogo} alt="LeanSprint" className="reset-password-mobile-logo" />
          </div>

          <div className="reset-password-container">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </div>
        </>
      ) : (
        /* Desktop Layout */
        <>
          {/* Desktop Header */}
          <div className="reset-password-desktop-header">
            <img src={leanSprintLogo} alt="LeanSprint" className="reset-password-desktop-logo" />
          </div>

          <div className="reset-password-container">
            <div className="reset-password-content">
              <div className="reset-password-image-container">
                <img src={authImage} alt="Reset Password" className="reset-password-image" />
              </div>
              
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="reset-password-form-footer">
        <span className="reset-password-form-footer-left">© Leansprintr by Taotter. All Rights Reserved.</span>
        <span className="reset-password-form-footer-right">Terms of Services</span>
      </div>
    </div>
  );
};

export default ResetPasswordPage;