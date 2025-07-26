import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/ui'
import signupImage from '../../assets/images/auth2.png'
import './SignUpPage.css'
import { useStartupRegisterMutation } from '../../store/api/authApi'
import { useLinkQuestionnaireMutation } from '../../store/api/questionnairesApi'
import { useAppDispatch } from '../../store/hooks'
import { loginSuccess } from '../../store/slices/authSlice'

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

const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M18.7509 10.1941C18.7509 9.47471 18.6913 8.94971 18.5624 8.40527H10.1794V11.6525H15.1C15.0009 12.4594 14.4652 13.6747 13.2747 14.4913L13.258 14.6L15.9085 16.6123L16.0921 16.6303C17.7786 15.1039 18.7509 12.858 18.7509 10.1941Z" fill="#4285F4" />
    <path d="M10.1789 18.75C12.5896 18.75 14.6134 17.9722 16.0916 16.6305L13.2741 14.4916C12.5202 15.0068 11.5083 15.3666 10.1789 15.3666C7.81785 15.3666 5.81391 13.8402 5.09956 11.7305L4.99485 11.7392L2.2388 13.8295L2.20276 13.9277C3.67099 16.786 6.68686 18.75 10.1789 18.75Z" fill="#34A853" />
    <path d="M5.10002 11.7307C4.91153 11.1863 4.80244 10.6029 4.80244 10.0002C4.80244 9.39734 4.91153 8.81403 5.0901 8.2696L5.08511 8.15365L2.29451 6.02979L2.20321 6.07235C1.59808 7.25847 1.25085 8.59044 1.25085 10.0002C1.25085 11.4099 1.59808 12.7418 2.20321 13.9279L5.10002 11.7307Z" fill="#FBBC05" />
    <path d="M10.179 4.63331C11.8555 4.63331 12.9865 5.34303 13.6313 5.93612L16.1512 3.525C14.6036 2.11528 12.5897 1.25 10.179 1.25C6.68689 1.25 3.671 3.21387 2.20276 6.07218L5.08966 8.26943C5.81393 6.15972 7.81788 4.63331 10.179 4.63331Z" fill="#EB4335" />
  </svg>
);

const SignUpPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [startupRegister] = useStartupRegisterMutation()
  const [linkQuestionnaire] = useLinkQuestionnaireMutation()
  
  const [formData, setFormData] = useState({
    email: '',
    founderFirstName: '',
    founderLastName: '',
    companyName: '',
    mobileNumber: '',
    password: '',
    agreeToTerms: false
  })
  const [countryCode, setCountryCode] = useState('+974')
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.founderFirstName.trim()) {
      newErrors.founderFirstName = 'First name is required'
    }
    if (!formData.founderLastName.trim()) {
      newErrors.founderLastName = 'Last name is required'
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required'
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required'
    } else if (!/^\d{8,15}$/.test(formData.mobileNumber.replace(/\s+/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid mobile number'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the Terms and Conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCountryCodeChange = (code) => {
    setCountryCode(code)
  }

  const handleMobileNumberChange = (value) => {
    const cleanValue = value.replace(new RegExp(`^\\${countryCode}`), '').trim()
    updateFormData('mobileNumber', cleanValue)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)
    try {
      const registerData = {
        email: formData.email,
        password: formData.password,
        phone: formData.mobileNumber,
        profile: {
          founderFirstName: formData.founderFirstName,
          founderLastName: formData.founderLastName,
          companyName: formData.companyName
        }
      }
      const response = await startupRegister(registerData).unwrap()
      if (response && response.data && response.data.tokens && response.data.startup) {
        dispatch(loginSuccess({
          user: response.data.startup,
          token: response.data.tokens.accessToken,
          refreshToken: response.data.tokens.refreshToken,
          userType: 'startup',
          permissions: [],
        }))
      }
      const tempId = localStorage.getItem('taotter-mvp-temporary-id')
      if (tempId) {
        try {
          await linkQuestionnaire(tempId).unwrap()
          localStorage.removeItem('taotter-mvp-temporary-id')
        } catch (linkErr) {
          console.error('Questionnaire linking failed:', linkErr)
        }
      }
      navigate('/startup/login')
    } catch (error) {
      console.error('Signup error:', error)
      setErrors({ submit: 'Signup failed. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = () => {
    console.log('Google sign in clicked')
  }

  return (
    <div className="signup-page">
      {isMobile ? (
        <>
          <div className="signup-mobile-header">
            <div className="signup-mobile-header-title">
              Sign Up
            </div>
          </div>
          <div className="signup-mobile-container">
            <div className="signup-mobile-title">
              Create Your Account
            </div>
            <button
              type="button"
              className="signup-google-btn"
              onClick={handleGoogleSignIn}
            >
              <GoogleLogo />
              Sign up with Google
            </button>
            <div className="signup-divider">
              <div className="divider-line"></div>
              <span className="divider-text">or</span>
              <div className="divider-line"></div>
            </div>
            <form onSubmit={handleSubmit} className="signup-form">
              <div className="signup-form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="Enter your email"
                  required
                />
                {errors.email && <div className="error-message">{errors.email}</div>}
              </div>
              <div className="signup-form-row">
                <div className="signup-form-col">
                  <div className="signup-form-field">
                    <label htmlFor="founderFirstName">First Name</label>
                    <input
                      id="founderFirstName"
                      type="text"
                      value={formData.founderFirstName}
                      onChange={(e) => updateFormData('founderFirstName', e.target.value)}
                      placeholder="Enter your first name"
                      required
                    />
                    {errors.founderFirstName && <div className="error-message">{errors.founderFirstName}</div>}
                  </div>
                </div>
                <div className="signup-form-col">
                  <div className="signup-form-field">
                    <label htmlFor="founderLastName">Last Name</label>
                    <input
                      id="founderLastName"
                      type="text"
                      value={formData.founderLastName}
                      onChange={(e) => updateFormData('founderLastName', e.target.value)}
                      placeholder="Enter your last name"
                      required
                    />
                    {errors.founderLastName && <div className="error-message">{errors.founderLastName}</div>}
                  </div>
                </div>
              </div>
              <div className="signup-form-field">
                <label htmlFor="companyName">Company Name</label>
                <input
                  id="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => updateFormData('companyName', e.target.value)}
                  placeholder="Enter your company name"
                  required
                />
                {errors.companyName && <div className="error-message">{errors.companyName}</div>}
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
                {errors.mobileNumber && <div className="error-message">{errors.mobileNumber}</div>}
              </div>
              <div className="signup-form-field">
                <label htmlFor="password">Password</label>
                <div className="password-field-container">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Icon name={showPassword ? 'eye-disabled' : 'Eye'} size={20} />
                  </button>
                </div>
                {errors.password && <div className="error-message">{errors.password}</div>}
              </div>
              <div className="terms-checkbox-container">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    id="agreeToTermsMobile"
                    checked={formData.agreeToTerms}
                    onChange={(e) => updateFormData('agreeToTerms', e.target.checked)}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="terms-checkbox-label">
                    By creating an account means you agree to the{' '}
                    <a
                      href="/terms-and-conditions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="terms-link"
                    >
                      Terms and Conditions
                    </a>
                    , and our{' '}
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
              {errors.agreeToTerms && <div className="error-message">{errors.agreeToTerms}</div>}
              {errors.submit && (
                <div className="submit-error">{errors.submit}</div>
              )}
              <button
                type="submit"
                className="signup-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing up...' : 'Sign up'}
              </button>
            </form>
          </div>
        </>
      ) : (
        <div className="signup-split-container">
          <div className="signup-left">
            <div className="signup-form-title">
              Sign up
            </div>
            <div className="signup-form-subtitle">
              Enter your email and password to sign up!
            </div>
            <button
              type="button"
              className="signup-google-btn"
              onClick={handleGoogleSignIn}
            >
              <GoogleLogo />
              Sign up with Google
            </button>
            <div className="signup-divider">
              <div className="divider-line"></div>
              <span className="divider-text">or</span>
              <div className="divider-line"></div>
            </div>
            <form onSubmit={handleSubmit} className="signup-form">
              <div className="signup-form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="Enter your email"
                  required
                />
                {errors.email && <div className="error-message">{errors.email}</div>}
              </div>
              <div className="signup-form-row">
                <div className="signup-form-col">
                  <div className="signup-form-field">
                    <label htmlFor="founderFirstName">First Name</label>
                    <input
                      id="founderFirstName"
                      type="text"
                      value={formData.founderFirstName}
                      onChange={(e) => updateFormData('founderFirstName', e.target.value)}
                      placeholder="Enter your first name"
                      required
                    />
                    {errors.founderFirstName && <div className="error-message">{errors.founderFirstName}</div>}
                  </div>
                </div>
                <div className="signup-form-col">
                  <div className="signup-form-field">
                    <label htmlFor="founderLastName">Last Name</label>
                    <input
                      id="founderLastName"
                      type="text"
                      value={formData.founderLastName}
                      onChange={(e) => updateFormData('founderLastName', e.target.value)}
                      placeholder="Enter your last name"
                      required
                    />
                    {errors.founderLastName && <div className="error-message">{errors.founderLastName}</div>}
                  </div>
                </div>
              </div>
              <div className="signup-form-field">
                <label htmlFor="companyName">Company Name</label>
                <input
                  id="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => updateFormData('companyName', e.target.value)}
                  placeholder="Enter your company name"
                  required
                />
                {errors.companyName && <div className="error-message">{errors.companyName}</div>}
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
                {errors.mobileNumber && <div className="error-message">{errors.mobileNumber}</div>}
              </div>
              <div className="signup-form-field">
                <label htmlFor="password">Password</label>
                <div className="password-field-container">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Icon name={showPassword ? 'eye-disabled' : 'Eye'} size={20} />
                  </button>
                </div>
                {errors.password && <div className="error-message">{errors.password}</div>}
              </div>
              <div className="terms-checkbox-container">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={(e) => updateFormData('agreeToTerms', e.target.checked)}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="terms-checkbox-label">
                    By creating an account means you agree to the{' '}
                    <a
                      href="/terms-and-conditions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="terms-link"
                    >
                      Terms and Conditions
                    </a>
                    , and our{' '}
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
              {errors.agreeToTerms && <div className="error-message">{errors.agreeToTerms}</div>}
              {errors.submit && (
                <div className="submit-error">{errors.submit}</div>
              )}
              <button
                type="submit"
                className="signup-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing up...' : 'Sign up'}
              </button>
            </form>
          </div>
          <div className="signup-right">
            <img
              src={signupImage}
              alt="Sign Up Visual"
              className="signup-image"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default SignUpPage
