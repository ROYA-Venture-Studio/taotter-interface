import { useState } from "react";
import { Icon } from "../ui";
import leanSprintLogo from "../../assets/logo/LeanSprintNewLogo.png";
import passwordImage from "../../assets/images/password.png";
import "./ForgotPasswordModal.css";
import { 
  useStartupForgotPasswordMutation,
  useVerifyResetCodeMutation,
  useStartupResetPasswordMutation 
} from "../../store/api/authApi";

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: email, 2: verify code, 3: new password, 4: success
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [forgotPassword, { isLoading: isSendingEmail }] = useStartupForgotPasswordMutation();
  const [verifyCode, { isLoading: isVerifying }] = useVerifyResetCodeMutation();
  const [resetPassword, { isLoading: isResetting }] = useStartupResetPasswordMutation();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newCode = formData.code.split('');
    newCode[index] = value;
    const updatedCode = newCode.join('').slice(0, 6);
    
    setFormData(prev => ({ ...prev, code: updatedCode }));
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.querySelector(`.verification-digit-input:nth-child(${index + 2})`);
      if (nextInput) nextInput.focus();
    }
    
    // Clear errors when user starts typing
    if (errors.code) {
      setErrors(prev => ({ ...prev, code: null }));
    }
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !formData.code[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      const prevInput = document.querySelector(`.verification-digit-input:nth-child(${index})`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, code: pastedData }));
    
    // Focus the last filled input or first empty one
    setTimeout(() => {
      const targetIndex = Math.min(pastedData.length, 5);
      const targetInput = document.querySelector(`.verification-digit-input:nth-child(${targetIndex + 1})`);
      if (targetInput) targetInput.focus();
    }, 0);
  };

  const handleResendCode = async () => {
    try {
      await forgotPassword(formData.email).unwrap();
      // Clear any errors and show success message or toast
      setErrors({});
    } catch (error) {
      console.error("Resend code error:", error);
      setErrors({ 
        code: error.data?.message || "Failed to resend code. Please try again." 
      });
    }
  };

  const validateEmail = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCode = () => {
    const newErrors = {};
    
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

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    try {
      await forgotPassword(formData.email).unwrap();
      setStep(2);
    } catch (error) {
      console.error("Forgot password error:", error);
      setErrors({ 
        email: error.data?.message || "Failed to send reset email. Please try again." 
      });
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!validateCode()) return;

    try {
      await verifyCode({
        email: formData.email,
        code: formData.code
      }).unwrap();
      setStep(3);
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
      
      // Go to success screen
      setStep(4);
    } catch (error) {
      console.error("Password reset error:", error);
      setErrors({ 
        newPassword: error.data?.message || "Failed to reset password. Please try again." 
      });
    }
  };

  const handleClose = () => {
    setFormData({
      email: "",
      code: "",
      newPassword: "",
      confirmPassword: ""
    });
    setErrors({});
    setStep(1);
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const handleBackToLogin = () => {
    handleClose();
  };

  if (!isOpen) return null;

  const renderStep1 = () => (
    <>
      <div className="forgot-password-modal-title">Forgot Password?</div>
      <div className="forgot-password-modal-subtitle">
        Enter your email address and we'll send you a code to reset your password
      </div>
      
      <form onSubmit={handleSendEmail} className="forgot-password-modal-form">
        <div className="forgot-password-modal-field">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter email address"
            className={errors.email ? "error" : ""}
          />
          {errors.email && (
            <div className="error-message">{errors.email}</div>
          )}
        </div>

        <button
          type="submit"
          className="forgot-password-modal-confirm-btn"
          disabled={isSendingEmail}
        >
          {isSendingEmail ? "Sending..." : "Confirm"}
        </button>
        
        <button
          type="button"
          className="forgot-password-modal-cancel-btn"
          onClick={handleClose}
        >
          Cancel
        </button>
      </form>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="forgot-password-modal-title">Enter Verification Code</div>
      <div className="forgot-password-modal-subtitle">
        We've sent a 6-digit verification code to {formData.email}
      </div>
      <div className="forgot-password-modal-expire-text">
        The code will expire in 10 minutes.
      </div>
      
      <form onSubmit={handleVerifyCode} className="forgot-password-modal-form">
        <div className="forgot-password-modal-field">
          <div className="verification-code-inputs">
            {[...Array(6)].map((_, index) => (
              <input
                key={index}
                type="text"
                className="verification-digit-input"
                maxLength={1}
                value={formData.code[index] || ''}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleDigitKeyDown(index, e)}
                onPaste={(e) => handlePaste(e)}
              />
            ))}
          </div>
          {errors.code && (
            <div className="error-message">{errors.code}</div>
          )}
        </div>

        <div className="resend-code-section">
          <span className="resend-code-text">
            Didn't get a code? 
            <button
              type="button"
              className="resend-code-link"
              onClick={handleResendCode}
              disabled={isSendingEmail}
            >
              {isSendingEmail ? 'Sending...' : 'Click to resend'}
            </button>
          </span>
        </div>

        <button
          type="submit"
          className="forgot-password-modal-confirm-btn verification-confirm-btn"
          disabled={isVerifying}
        >
          {isVerifying ? "Verifying..." : "Verify Code"}
        </button>
      </form>
    </>
  );

  const renderStep3 = () => (
    <>
      <div className="forgot-password-modal-title">Set New Password</div>
      <div className="forgot-password-modal-subtitle">
        Must be at least 8 characters
      </div>
      
      <form onSubmit={handleResetPassword} className="forgot-password-modal-form">
        <div className="forgot-password-modal-field">
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

        <div className="forgot-password-modal-field">
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
          className="forgot-password-modal-confirm-btn verification-confirm-btn"
          disabled={isResetting}
        >
          {isResetting ? "Resetting..." : "Confirm"}
        </button>
      </form>
    </>
  );

  const renderStep4 = () => (
    <>
      <div className="forgot-password-modal-success-content">
        <img src={passwordImage} alt="Password Reset Success" className="forgot-password-success-image" />
        
        <div className="forgot-password-modal-subtitle">
          Your Password has been reset
        </div>
        
        <div className="forgot-password-modal-title">
          Successfully
        </div>
        
        <button
          type="button"
          className="forgot-password-modal-confirm-btn"
          onClick={handleClose}
        >
          Sign in
        </button>
      </div>
    </>
  );

  return (
    <div className="forgot-password-modal-overlay" onClick={handleClose}>
      <div className="forgot-password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="forgot-password-modal-header">
          <img src={leanSprintLogo} alt="Leansprintr" className="forgot-password-modal-logo" />
        </div>
        
        <div className="forgot-password-modal-content">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        {step !== 4 && (
          <div className={`forgot-password-modal-footer ${step === 3 ? 'reduced-margin' : ''}`}>
            <button
              className="forgot-password-modal-back-link"
              onClick={step === 2 ? () => setStep(1) : handleBackToLogin}
            >
              {step === 2 ? "Back to Email Entry" : "Back to Log In"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;