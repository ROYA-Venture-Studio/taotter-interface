import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Input, TextArea } from '../../components/ui'
import './SprintOnboardingStep1.css'

const SprintOnboardingStep1 = () => {
  const navigate = useNavigate()
  const { sprintId } = useParams()
  
  const [formData, setFormData] = useState({
    brandGuidelines: null,
    contactLists: '',
    appDemo: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // REMOVED: All the problematic redirect logic that was causing the loop

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
      // TODO: Upload file and save form data to API
      console.log('Form data:', formData)
      console.log('Sprint ID:', sprintId)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Navigate to next step with sprint ID
      navigate(`/sprint/${sprintId}/onboarding/step-2`)
      
    } catch (error) {
      console.error('Error saving data:', error)
      setErrors({ submit: 'Failed to save data. Please try again.' })
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
        <div className="sprint-onboarding-card">
          <div className="sprint-onboarding-header">
            <h1>Start Your Sprint</h1>
          </div>
          <div className="sprint-onboarding-content">
            <h2>Error</h2>
            <p>Sprint ID not found. Please go back to sprint selection.</p>
            <button onClick={() => navigate('/sprint/status')}>Back to Sprint Selection</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="sprint-onboarding-page">
      <div className="sprint-onboarding-card">
        <div className="sprint-onboarding-header">
          <h1>Start Your Sprint</h1>
        </div>
        
        <div className="sprint-onboarding-content">
          <div className="onboarding-title">
            <h2>Your Startup Material</h2>
            <p>To begin efficiently, we kindly request access to the following (all fields are optional):</p>
          </div>
          
          <div className="onboarding-form">
            {/* Brand Guidelines Upload */}
            <div className="form-field">
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
                <div className="field-error">{errors.brandGuidelines}</div>
              )}
            </div>

            {/* Contact Lists */}
            <div className="form-field">
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
            <div className="form-field">
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
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="submit-error">{errors.submit}</div>
          )}

          {/* Navigation Buttons */}
          <div className="onboarding-navigation">
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
      </div>
    </div>
  )
}

export default SprintOnboardingStep1
