import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Icon } from '../../components/ui'
import TaotterLogo from '../../assets/logo/Taotter_logo.svg'
import { useStartupRegisterMutation } from '../../store/api/authApi'
import { useLinkQuestionnaireMutation } from '../../store/api/questionnairesApi'
import { useAppDispatch } from '../../store/hooks'
import { loginSuccess } from '../../store/slices/authSlice'
import './AuthPage.css'

const SignUpPage = () => {
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
    
    // Clear error when user starts typing
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Prepare data for API
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

      // Call the registration API
      const response = await startupRegister(registerData).unwrap()

      // Store tokens and user in Redux/localStorage for authenticated requests
      if (response && response.data && response.data.tokens && response.data.startup) {
        dispatch(loginSuccess({
          user: response.data.startup,
          token: response.data.tokens.accessToken,
          refreshToken: response.data.tokens.refreshToken,
          userType: 'startup',
          permissions: [],
        }))
      }

      // Link questionnaire if temporaryId exists
      const tempId = localStorage.getItem('taotter-mvp-temporary-id')
      if (tempId) {
        try {
          await linkQuestionnaire(tempId).unwrap()
          localStorage.removeItem('taotter-mvp-temporary-id')
        } catch (linkErr) {
          // Optionally handle questionnaire linking error
          console.error('Questionnaire linking failed:', linkErr)
        }
      }

      // Navigate to dashboard or welcome page
      navigate('/startup/login') // Update this to your desired route

    } catch (error) {
      console.error('Signup error:', error)
      setErrors({ submit: 'Signup failed. Please try again.' })
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
    <div className="signup-page">

      {/* Main Content */}
      <main className="signup-main">
        <div className="signup-container">
          <div className="signup-card">
            <div className="signup-form-area">
              
              {/* Title Section */}
              <div className="signup-title-section">
                <h1 className="signup-title">Sign up</h1>
                <p className="signup-subtitle">
                  Enter your mobile number and password to sign up!
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="signup-form">
                
                {/* Google Sign In */}
                <Button
                  type="button"
                  variant="secondary"
                  className="google-signin-btn"
                  onClick={handleGoogleSignIn}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M18.7509 10.1941C18.7509 9.47471 18.6913 8.94971 18.5624 8.40527H10.1794V11.6525H15.1C15.0009 12.4594 14.4652 13.6747 13.2747 14.4913L13.258 14.6L15.9085 16.6123L16.0921 16.6303C17.7786 15.1039 18.7509 12.858 18.7509 10.1941Z" fill="#4285F4" />
                    <path d="M10.1789 18.75C12.5896 18.75 14.6134 17.9722 16.0916 16.6305L13.2741 14.4916C12.5202 15.0068 11.5083 15.3666 10.1789 15.3666C7.81785 15.3666 5.81391 13.8402 5.09956 11.7305L4.99485 11.7392L2.2388 13.8295L2.20276 13.9277C3.67099 16.786 6.68686 18.75 10.1789 18.75Z" fill="#34A853" />
                    <path d="M5.10002 11.7307C4.91153 11.1863 4.80244 10.6029 4.80244 10.0002C4.80244 9.39734 4.91153 8.81403 5.0901 8.2696L5.08511 8.15365L2.29451 6.02979L2.20321 6.07235C1.59808 7.25847 1.25085 8.59044 1.25085 10.0002C1.25085 11.4099 1.59808 12.7418 2.20321 13.9279L5.10002 11.7307Z" fill="#FBBC05" />
                    <path d="M10.179 4.63331C11.8555 4.63331 12.9865 5.34303 13.6313 5.93612L16.1512 3.525C14.6036 2.11528 12.5897 1.25 10.179 1.25C6.68689 1.25 3.671 3.21387 2.20276 6.07218L5.08966 8.26943C5.81393 6.15972 7.81788 4.63331 10.179 4.63331Z" fill="#EB4335" />
                  </svg>
                  Sign in with Google
                </Button>

                {/* Divider */}
                <div className="signup-divider">
                  <div className="divider-line"></div>
                  <span className="divider-text">or</span>
                  <div className="divider-line"></div>
                </div>

                {/* Form Fields */}
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
                  <Input
                    label="First Name"
                    type="text"
                    value={formData.founderFirstName}
                    onChange={(e) => updateFormData('founderFirstName', e.target.value)}
                    placeholder="Enter your first name"
                    error={errors.founderFirstName}
                    required
                  />
                  <Input
                    label="Last Name"
                    type="text"
                    value={formData.founderLastName}
                    onChange={(e) => updateFormData('founderLastName', e.target.value)}
                    placeholder="Enter your last name"
                    error={errors.founderLastName}
                    required
                  />
                  <Input
                    label="Company Name"
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => updateFormData('companyName', e.target.value)}
                    placeholder="Enter your company name (optional)"
                  />
                  <Input
                    label="Mobile Number"
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) => updateFormData('mobileNumber', e.target.value)}
                    placeholder="Enter your number"
                    error={errors.mobileNumber}
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
                <div className="signup-options">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={formData.keepLoggedIn}
                      onChange={(e) => updateFormData('keepLoggedIn', e.target.checked)}
                      className="checkbox-input"
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

                {/* Submit Error */}
                {errors.submit && (
                  <div className="submit-error">{errors.submit}</div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  className="signup-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing up...' : 'Sign up'}
                </Button>
              </form>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SignUpPage
