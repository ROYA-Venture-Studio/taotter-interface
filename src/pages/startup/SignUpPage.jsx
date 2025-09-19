import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/ui";
import signupImage from "../../assets/images/form.png";
import leanSprintLogo from "../../assets/logo/LeanSprintNewLogo.png";
import "./SignUpPage.css";
import { useStartupRegisterMutation } from "../../store/api/authApi";
import { useLinkQuestionnaireMutation } from "../../store/api/questionnairesApi";
import { useAppDispatch } from "../../store/hooks";
import { loginSuccess } from "../../store/slices/authSlice";

// Mobile detection hook
function useIsMobile(breakpoint = 768) {
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

const SignUpPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [startupRegister] = useStartupRegisterMutation();
  const [linkQuestionnaire] = useLinkQuestionnaireMutation();

  const [formData, setFormData] = useState({
    email: "",
    founderFirstName: "",
    founderLastName: "",
    companyName: "",
    mobileNumber: "",
    password: "",
    agreeToTerms: false,
  });
  const [countryCode, setCountryCode] = useState("+974");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.founderFirstName.trim()) {
      newErrors.founderFirstName = "First name is required";
    }
    if (!formData.founderLastName.trim()) {
      newErrors.founderLastName = "Last name is required";
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{8,15}$/.test(formData.mobileNumber.replace(/\s+/g, ""))) {
      newErrors.mobileNumber = "Please enter a valid mobile number";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the Terms and Conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCountryCodeChange = (code) => {
    setCountryCode(code);
  };

  const handleMobileNumberChange = (value) => {
    const cleanValue = value
      .replace(new RegExp(`^\\${countryCode}`), "")
      .trim();
    updateFormData("mobileNumber", cleanValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const registerData = {
        email: formData.email,
        password: formData.password,
        phone: formData.mobileNumber,
        profile: {
          founderFirstName: formData.founderFirstName,
          founderLastName: formData.founderLastName,
          companyName: formData.companyName,
        },
      };
      const response = await startupRegister(registerData).unwrap();
      if (
        response &&
        response.data &&
        response.data.tokens &&
        response.data.startup
      ) {
        dispatch(
          loginSuccess({
            user: response.data.startup,
            token: response.data.tokens.accessToken,
            refreshToken: response.data.tokens.refreshToken,
            userType: "startup",
            permissions: [],
          })
        );
      }
      const tempId = localStorage.getItem("taotter-mvp-temporary-id");
      if (tempId) {
        try {
          await linkQuestionnaire(tempId).unwrap();
          localStorage.removeItem("taotter-mvp-temporary-id");
        } catch (linkErr) {
          console.error("Questionnaire linking failed:", linkErr);
        }
      }
      navigate("/startup/login");
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({ submit: "Signup failed. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-page">
      {isMobile ? (
        <>
          <div className="signup-mobile-header">
            <img
              src={leanSprintLogo}
              alt="LeanSprint Logo"
              className="signup-mobile-logo"
            />
            <button 
              className="signup-mobile-back-btn"
              onClick={() => navigate("/")}
            >
              Back to home
            </button>
          </div>
          <div className="signup-mobile-container">
            <div className="signup-mobile-title">Create Your Account</div>
            <form onSubmit={handleSubmit} className="signup-form">
              <div className="signup-form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  placeholder="Enter your email"
                  required
                />
                {errors.email && (
                  <div className="error-message">{errors.email}</div>
                )}
              </div>
              <div className="signup-form-row">
                <div className="signup-form-col">
                  <div className="signup-form-field">
                    <label htmlFor="founderFirstName">First Name</label>
                    <input
                      id="founderFirstName"
                      type="text"
                      value={formData.founderFirstName}
                      onChange={(e) =>
                        updateFormData("founderFirstName", e.target.value)
                      }
                      placeholder="Enter your first name"
                      required
                    />
                    {errors.founderFirstName && (
                      <div className="error-message">
                        {errors.founderFirstName}
                      </div>
                    )}
                  </div>
                </div>
                <div className="signup-form-col">
                  <div className="signup-form-field">
                    <label htmlFor="founderLastName">Last Name</label>
                    <input
                      id="founderLastName"
                      type="text"
                      value={formData.founderLastName}
                      onChange={(e) =>
                        updateFormData("founderLastName", e.target.value)
                      }
                      placeholder="Enter your last name"
                      required
                    />
                    {errors.founderLastName && (
                      <div className="error-message">
                        {errors.founderLastName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="signup-form-field">
                <label htmlFor="companyName">Company Name</label>
                <input
                  id="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={(e) =>
                    updateFormData("companyName", e.target.value)
                  }
                  placeholder="Enter your company name"
                  required
                />
                {errors.companyName && (
                  <div className="error-message">{errors.companyName}</div>
                )}
              </div>
              <div className="signup-form-field">
                <label htmlFor="mobileNumber">Mobile Number</label>
                <div className="mobile-number-container">
                  <select
                    className="country-code-dropdown"
                    value={countryCode}
                    onChange={(e) => handleCountryCodeChange(e.target.value)}
                  >
                    <option value="+974">QAR</option>
                    <option value="+971">UAE</option>
                    <option value="+966">SA</option>
                  </select>
                  <input
                    id="mobileNumber"
                    type="tel"
                    className="mobile-number-input"
                    value={`${countryCode} ${formData.mobileNumber}`}
                    onChange={(e) => handleMobileNumberChange(e.target.value)}
                    placeholder={`${countryCode} Enter your number`}
                    required
                  />
                </div>
                {errors.mobileNumber && (
                  <div className="error-message">{errors.mobileNumber}</div>
                )}
              </div>
              <div className="signup-form-field">
                <label htmlFor="password">Password</label>
                <div className="password-field-container">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <Icon
                      name={showPassword ? "eye-disabled" : "Eye"}
                      size={20}
                    />
                  </button>
                </div>
                {errors.password && (
                  <div className="error-message">{errors.password}</div>
                )}
              </div>
              <div className="terms-checkbox-container">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    id="agreeToTermsMobile"
                    checked={formData.agreeToTerms}
                    onChange={(e) =>
                      updateFormData("agreeToTerms", e.target.checked)
                    }
                    style={{
                      position: "absolute",
                      opacity: 0,
                      width: 0,
                      height: 0,
                    }}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="terms-checkbox-label">
                    By creating an account means you agree to the{" "}
                    <a
                      href="/terms-and-conditions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="terms-link"
                    >
                      Terms and Conditions
                    </a>
                    , and our{" "}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="terms-link"
                    >
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>
              {errors.agreeToTerms && (
                <div className="error-message">{errors.agreeToTerms}</div>
              )}
              {errors.submit && (
                <div className="submit-error">{errors.submit}</div>
              )}
              <button
                type="submit"
                className="signup-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing up..." : "Sign up"}
              </button>
            </form>

            {/* Footer */}
            <div className="signup-form-footer">
              <div className="signup-form-footer-left">© Leansprintr 2025. All Rights Reserved</div>
              <div className="signup-form-footer-right">Terms of Services</div>
            </div>
          </div>
        </>
      ) : (
        <div className="signup-split-container">
          <div className="signup-left">
            {/* Desktop Header */}
            <div className="signup-desktop-header">
              <img
                src={leanSprintLogo}
                alt="LeanSprint Logo"
                className="signup-desktop-logo"
              />
              <button 
                className="signup-desktop-back-btn"
                onClick={() => navigate("/")}
              >
                Back to home
              </button>
            </div>

            <div className="signup-form-title">Sign up</div>
            <div className="signup-form-subtitle">
              Enter your email and password to sign up!
            </div>
            <form onSubmit={handleSubmit} className="signup-form">
              <div className="signup-form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  placeholder="Enter your email"
                  required
                />
                {errors.email && (
                  <div className="error-message">{errors.email}</div>
                )}
              </div>
              <div className="signup-form-row">
                <div className="signup-form-col">
                  <div className="signup-form-field">
                    <label htmlFor="founderFirstName">First Name</label>
                    <input
                      id="founderFirstName"
                      type="text"
                      value={formData.founderFirstName}
                      onChange={(e) =>
                        updateFormData("founderFirstName", e.target.value)
                      }
                      placeholder="Enter your first name"
                      required
                    />
                    {errors.founderFirstName && (
                      <div className="error-message">
                        {errors.founderFirstName}
                      </div>
                    )}
                  </div>
                </div>
                <div className="signup-form-col">
                  <div className="signup-form-field">
                    <label htmlFor="founderLastName">Last Name</label>
                    <input
                      id="founderLastName"
                      type="text"
                      value={formData.founderLastName}
                      onChange={(e) =>
                        updateFormData("founderLastName", e.target.value)
                      }
                      placeholder="Enter your last name"
                      required
                    />
                    {errors.founderLastName && (
                      <div className="error-message">
                        {errors.founderLastName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="signup-form-field">
                <label htmlFor="companyName">Company Name</label>
                <input
                  id="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={(e) =>
                    updateFormData("companyName", e.target.value)
                  }
                  placeholder="Enter your company name"
                  required
                />
                {errors.companyName && (
                  <div className="error-message">{errors.companyName}</div>
                )}
              </div>
              <div className="signup-form-field">
                <label htmlFor="mobileNumber">Mobile Number</label>
                <div className="mobile-number-container">
                  <select
                    className="country-code-dropdown"
                    value={countryCode}
                    onChange={(e) => handleCountryCodeChange(e.target.value)}
                  >
                    <option value="+974">QAR</option>
                    <option value="+971">UAE</option>
                    <option value="+966">SA</option>
                  </select>
                  <input
                    id="mobileNumber"
                    type="tel"
                    className="mobile-number-input"
                    value={`${countryCode} ${formData.mobileNumber}`}
                    onChange={(e) => handleMobileNumberChange(e.target.value)}
                    placeholder={`${countryCode} Enter your number`}
                    required
                  />
                </div>
                {errors.mobileNumber && (
                  <div className="error-message">{errors.mobileNumber}</div>
                )}
              </div>
              <div className="signup-form-field">
                <label htmlFor="password">Password</label>
                <div className="password-field-container">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <Icon
                      name={showPassword ? "eye-disabled" : "Eye"}
                      size={20}
                    />
                  </button>
                </div>
                {errors.password && (
                  <div className="error-message">{errors.password}</div>
                )}
              </div>
              <div className="terms-checkbox-container">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={(e) =>
                      updateFormData("agreeToTerms", e.target.checked)
                    }
                    style={{
                      position: "absolute",
                      opacity: 0,
                      width: 0,
                      height: 0,
                    }}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="terms-checkbox-label">
                    By creating an account means you agree to the{" "}
                    <a
                      href="/terms-and-conditions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="terms-link"
                    >
                      Terms and Conditions
                    </a>
                    , and our{" "}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="terms-link"
                    >
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>
              {errors.agreeToTerms && (
                <div className="error-message">{errors.agreeToTerms}</div>
              )}
              {errors.submit && (
                <div className="submit-error">{errors.submit}</div>
              )}
              <button
                type="submit"
                className="signup-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing up..." : "Sign up"}
              </button>
            </form>

            {/* Footer */}
            <div className="signup-form-footer">
              <div className="signup-form-footer-left">© Leansprintr 2025. All Rights Reserved</div>
              <div className="signup-form-footer-right">Terms of Services</div>
            </div>
          </div>
          <div className="signup-right">
            <img
              src={signupImage}
              alt="Sign Up Visual"
              className="signup-image"
            />
            <div className="signup-image-overlay">
              <h2>From Idea to Customers</h2>
              <p>
                Turn your startup idea into real traction with step-by-step
                guided sprints.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUpPage;
