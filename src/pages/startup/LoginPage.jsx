import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Icon } from '../../components/ui'
import TaotterLogo from '../../assets/logo/Taotter_logo.svg'
import { useStartupLoginMutation } from '../../store/api/authApi'
import { useAppDispatch } from '../../store/hooks'
import { loginSuccess } from '../../store/slices/authSlice'
import DashboardLayout from '../../layouts/DashboardLayout'
import './AuthPage.css'

const LoginPage = () => {
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

  const handleGoogleSignIn = () => {
    // TODO: Implement Google OAuth
    console.log('Google sign in clicked')
  }

  const handleForgotPassword = () => {
    // TODO: Navigate to forgot password page or show modal
    console.log('Forgot password clicked')
  }

  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <DashboardLayout>
      <div className="signup-page" style={{ marginTop: 8 }}>
        {/* Main Content */}
        <main className="signup-main">
          <div className="signup-container">
            <div className="signup-card">
              <div className="signup-form-area">
                {/* Title Section */}
                <div className="signup-title-section">
                  <h1 className="signup-title">Log in</h1>
                  <p className="signup-subtitle">
                    Enter your email and password to log in!
                  </p>
                </div>
                {/* Form */}
                <form onSubmit={handleSubmit} className="signup-form">
                  <div className="signup-inputs">
                    <Input
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      placeholder="Enter your email"
                      error={errors.email}
                      required
                    />
                    <div className="password-input-container">
                      <Input
                        label="Password*"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => updateFormData('password', e.target.value)}
                        placeholder="Enter your password"
                        error={errors.password}
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
                  </div>
                  {/* Form Options */}
                  {/* <div className="signup-options">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={formData.keepLoggedIn}
                        onChange={(e) => updateFormData('keepLoggedIn', e.target.checked)}
                        className="checkbox-input"
                      /> */}
                      {/* <span className="checkbox-custom"></span>
                      <span className="checkbox-label">Keep me logged in</span> */}
                    {/* </label> */}
                    {/* <button
                      type="button"
                      className="forgot-password-link"
                      onClick={handleForgotPassword}
                    >
                      Forgot password?
                    </button> */}
                  {/* </div> */}
                  {/* Submit Error */}
                  {errors.submit && (
                    <div className="submit-error">{errors.submit}</div>
                  )}
                  {/* Submit Button */}
                  <div style={{ display: "flex", justifyContent: "center", marginTop: 0 }}>
                    <Button
                      type="submit"
                      variant="primary"
                      className="signup-submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Logging in...' : 'Log in'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  )
}

export default LoginPage
