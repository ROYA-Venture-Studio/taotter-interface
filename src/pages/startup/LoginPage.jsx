import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/ui'
import authImage from '../../assets/images/login.png'
import './LoginPage.css'
import { useStartupLoginMutation } from '../../store/api/authApi'
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

const LoginPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [startupLogin] = useStartupLoginMutation()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    keepLoggedIn: false
  })
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
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)

    try {
      // Use email for API
      const loginData = {
        email: formData.email,
        password: formData.password
      }
      // Call the login API
      const response = await startupLogin(loginData).unwrap()
      // Store tokens and user in Redux/localStorage for authenticated requests
      if (response && response.data && response.data.tokens && response.data.startup) {
        dispatch(loginSuccess({
          user: response.data.startup,
          token: response.data.tokens.accessToken,
          refreshToken: response.data.tokens.refreshToken,
          userType: 'startup',
          permissions: [],
        }))
        
        // CORRECTED ROUTING LOGIC:
        // Check user's onboarding status to determine where to send them
        const onboardingStep = response.data.startup.onboarding?.currentStep
        
        // If onboarding is complete or user has active sprint, go to dashboard
        if (onboardingStep === 'completed' || 
            onboardingStep === 'active_sprint' ||
            onboardingStep === 'document_upload' ||  
            onboardingStep === 'meeting_scheduled') {
          navigate('/startup/dashboard')
        } else {
          // Only send to sprint status if onboarding is incomplete
          navigate('/sprint/status')
        }
        
      } else {
        setErrors({ submit: 'Login failed. Please try again.' })
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ submit: 'Login failed. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = () => {
    // TODO: Navigate to forgot password page or show modal
    console.log('Forgot password clicked')
  }

  return (
    <div className="login-page">
      {isMobile ? (
        <>
          <div className="login-mobile-header">
            <div className="login-mobile-header-title">
              Log In
            </div>
          </div>
          <div className="login-mobile-container">
            <div className="login-mobile-title">
              Welcome Back
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-form-field">
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

              <div className="login-form-field">
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

              <div className="login-options">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={formData.keepLoggedIn}
                    onChange={(e) => updateFormData('keepLoggedIn', e.target.checked)}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-label">Keep me logged in</span>
                </label>
                
                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </button>
              </div>

              {errors.submit && (
                <div className="submit-error">{errors.submit}</div>
              )}

              <button
                type="submit"
                className="login-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Log in'}
              </button>
            </form>
          </div>
        </>
      ) : (
        <div className="login-split-container">
          {/* Left: Form */}
          <div className="login-left">
            <div className="login-form-title">
              Log in
            </div>
            <div className="login-form-subtitle">
              Enter your email and password to log in!
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-form-field">
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

              <div className="login-form-field">
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

              <div className="login-options">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={formData.keepLoggedIn}
                    onChange={(e) => updateFormData('keepLoggedIn', e.target.checked)}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-label">Keep me logged in</span>
                </label>
                
                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </button>
              </div>

              {errors.submit && (
                <div className="submit-error">{errors.submit}</div>
              )}

              <button
                type="submit"
                className="login-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Log in'}
              </button>
            </form>
          </div>

          {/* Right: Image */}
          <div className="login-right">
            <img
              src={authImage}
              alt="Login Visual"
              className="login-image"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginPage
