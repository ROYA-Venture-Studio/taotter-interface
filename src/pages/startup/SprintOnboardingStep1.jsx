import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Input, TextArea } from '../../components/ui'
import { useUploadDocumentsMutation } from '../../store/api/sprintsApi'
import longImage from '../../assets/images/long.png'
import './SprintOnboardingStep1.css'

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

const SprintOnboardingStep1 = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate()
  const { sprintId } = useParams()
  
  const [formData, setFormData] = useState({
    brandGuidelines: null,
    contactLists: '',
    appDemo: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadDocuments] = useUploadDocumentsMutation()

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing/selecting
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          brandGuidelines: 'Please upload a PDF or Word document'
        }))
        return
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          brandGuidelines: 'File size must be less than 10MB'
        }))
        return
      }
      
      updateFormData('brandGuidelines', file)
    }
  }

  const validateForm = () => {
    // All fields are now optional - no validation required
    // Users can proceed to step 2 with empty fields
    return true
  }

  const handleNext = async () => {
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData()
      
      // Add file if selected
      if (formData.brandGuidelines) {
        formDataToSend.append('brandGuidelines', formData.brandGuidelines)
      }
      
      // Add text fields
      formDataToSend.append('contactLists', formData.contactLists)
      formDataToSend.append('appDemo', formData.appDemo)
      
      // Use RTK Query mutation for upload
      const result = await uploadDocuments({ id: sprintId, body: formDataToSend }).unwrap()

      console.log('Upload successful:', result)

      // Navigate to next step with sprint ID
      navigate(`/sprint/${sprintId}/onboarding/step-2`)
      
    } catch (error) {
      console.error('Error saving data:', error)
      setErrors({ submit: error.message || 'Failed to save data. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    navigate('/sprint/status')
  }

  // Simple check for sprintId
  if (!sprintId) {
    return (
      <div className="sprint-onboarding-page">
        {isMobile ? (
          <>
            <div className="sprint-onboarding-mobile-header">
              <div className="sprint-onboarding-mobile-header-title">
                Start Your Sprint
              </div>
            </div>
            <div className="sprint-onboarding-mobile-container">
              <div className="sprint-onboarding-mobile-title">
                Error
              </div>
              <p>Sprint ID not found. Please go back to sprint selection.</p>
              <button onClick={() => navigate('/sprint/status')} className="sprint-get-started-btn">
                Back to Sprint Selection
              </button>
            </div>
          </>
        ) : (
          <div className="sprint-onboarding-split-container">
            <div className="sprint-onboarding-left">
              <div className="sprint-onboarding-form-title">
                Start Your Sprint
              </div>
              <div className="sprint-onboarding-form-subtitle">
                Sprint ID not found
              </div>
              <p>Please go back to sprint selection.</p>
              <button onClick={() => navigate('/sprint/status')} className="sprint-get-started-btn">
                Back to Sprint Selection
              </button>
            </div>
            <div className="sprint-onboarding-right">
              <img
                src={longImage}
                alt="Sprint Onboarding"
                className="sprint-onboarding-image"
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="sprint-onboarding-page">
      {isMobile ? (
        <>
          <div className="sprint-onboarding-mobile-header">
            <div className="sprint-onboarding-mobile-header-title">
              Start Your Sprint
            </div>
          </div>
          <div className="sprint-onboarding-mobile-container">
            <div className="sprint-onboarding-mobile-title">
              Your Startup Material
            </div>
            <p>To begin efficiently, we kindly request access to the following (all fields are optional):</p>
            
            <form className="sprint-onboarding-form">
              {/* Brand Guidelines Upload */}
              <div className="sprint-onboarding-form-field">
                <label className="field-label">Brand Guidelines (Optional)</label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    id="brandGuidelines"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="file-input"
                  />
                  <label htmlFor="brandGuidelines" className="file-upload-button">
                    <span>Upload Doc</span>
                    <div className="upload-icon">
                      <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                        <path d="M0.499573 12.585V15.085C0.499573 15.9134 1.17115 16.585 1.99957 16.585H15.0004C15.8289 16.585 16.5004 15.9134 16.5004 15.085V12.585" stroke="#323544" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M5.50156 0.584961L5.50156 12.585" stroke="#323544" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M0.874604 5.2098L5.49945 0.587891L10.1246 5.2098" stroke="#323544" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </label>
                  {formData.brandGuidelines && (
                    <div className="file-selected">
                      Selected: {formData.brandGuidelines.name}
                    </div>
                  )}
                </div>
                {errors.brandGuidelines && (
                  <div className="error-message">{errors.brandGuidelines}</div>
                )}
              </div>

              {/* Contact Lists */}
              <div className="sprint-onboarding-form-field">
                <label className="field-label">
                  Existing teacher contact lists, partner networks, or lead sources (Optional)
                </label>
                <TextArea
                  value={formData.contactLists}
                  onChange={(e) => updateFormData('contactLists', e.target.value)}
                  placeholder="Enter details about your existing contact lists, partner networks, or lead sources..."
                  rows={4}
                  error={errors.contactLists}
                />
              </div>

              {/* App/Demo Access */}
              <div className="sprint-onboarding-form-field">
                <label className="field-label">
                  Access to the app or demo (if available) (Optional)
                </label>
                <Input
                  type="url"
                  value={formData.appDemo}
                  onChange={(e) => updateFormData('appDemo', e.target.value)}
                  placeholder="Demo link or access details"
                  error={errors.appDemo}
                />
              </div>
            </form>

            {/* Submit Error */}
            {errors.submit && (
              <div className="submit-error">{errors.submit}</div>
            )}

            {/* Navigation Buttons */}
            <div className="sprint-onboarding-navigation">
              <Button
                variant="secondary"
                onClick={handleBack}
                className="nav-button back-button"
              >
                Back
              </Button>
              
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={isSubmitting}
                className="nav-button next-button"
              >
                {isSubmitting ? 'Saving...' : 'Next'}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="sprint-onboarding-split-container">
          <div className="sprint-onboarding-left">
            <div className="sprint-onboarding-form-title">
              Your Startup Material
            </div>
            <div className="sprint-onboarding-form-subtitle">
              To begin efficiently, we kindly request access to the following (all fields are optional)
            </div>
            
            <form className="sprint-onboarding-form">
              {/* Brand Guidelines Upload */}
              <div className="sprint-onboarding-form-field">
                <label className="field-label">Brand Guidelines (Optional)</label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    id="brandGuidelines"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="file-input"
                  />
                  <label htmlFor="brandGuidelines" className="file-upload-button">
                    <span>Upload Doc</span>
                    <div className="upload-icon">
                      <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                        <path d="M0.499573 12.585V15.085C0.499573 15.9134 1.17115 16.585 1.99957 16.585H15.0004C15.8289 16.585 16.5004 15.9134 16.5004 15.085V12.585" stroke="#323544" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M5.50156 0.584961L5.50156 12.585" stroke="#323544" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M0.874604 5.2098L5.49945 0.587891L10.1246 5.2098" stroke="#323544" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </label>
                  {formData.brandGuidelines && (
                    <div className="file-selected">
                      Selected: {formData.brandGuidelines.name}
                    </div>
                  )}
                </div>
                {errors.brandGuidelines && (
                  <div className="error-message">{errors.brandGuidelines}</div>
                )}
              </div>

              {/* Contact Lists */}
              <div className="sprint-onboarding-form-field">
                <label className="field-label">
                  Existing teacher contact lists, partner networks, or lead sources (Optional)
                </label>
                <TextArea
                  value={formData.contactLists}
                  onChange={(e) => updateFormData('contactLists', e.target.value)}
                  placeholder="Enter details about your existing contact lists, partner networks, or lead sources..."
                  rows={4}
                  error={errors.contactLists}
                />
              </div>

              {/* App/Demo Access */}
              <div className="sprint-onboarding-form-field">
                <label className="field-label">
                  Access to the app or demo (if available) (Optional)
                </label>
                <Input
                  type="url"
                  value={formData.appDemo}
                  onChange={(e) => updateFormData('appDemo', e.target.value)}
                  placeholder="Demo link or access details"
                  error={errors.appDemo}
                />
              </div>
            </form>

            {/* Submit Error */}
            {errors.submit && (
              <div className="submit-error">{errors.submit}</div>
            )}

            {/* Navigation Buttons */}
            <div className="sprint-onboarding-navigation">
              <Button
                variant="secondary"
                onClick={handleBack}
                className="nav-button back-button"
              >
                Back
              </Button>
              
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={isSubmitting}
                className="nav-button next-button"
              >
                {isSubmitting ? 'Saving...' : 'Next'}
              </Button>
            </div>
          </div>
          <div className="sprint-onboarding-right">
            <img
              src={longImage}
              alt="Sprint Onboarding"
              className="sprint-onboarding-image"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default SprintOnboardingStep1
