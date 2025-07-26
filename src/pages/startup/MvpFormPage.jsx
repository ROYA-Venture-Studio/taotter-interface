import { useState, useEffect } from 'react'

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
import { useNavigate } from 'react-router-dom'
import formImage from '../../assets/images/form.png'
import './MvpFormPage.css'
import { useCreateQuestionnaireMutation } from '../../store/api/questionnairesApi'

const MvpFormPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate()
  const [createQuestionnaire] = useCreateQuestionnaireMutation()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  
  // Form data state
  const [formData, setFormData] = useState({
    // Step 1
    startupName: '',
    taskName: '',
    taskDescription: '',
    stage: '',
    keyGoals: '',
    timeCommitment: 'full-time',
    
    // Step 2
    timeline: '',
    budgetRange: '',
    
    // Step 3
    selectedSprint: null,
    customRequest: ''
  })

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('taotter-mvp-form-data')
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData))
      } catch (error) {
        console.error('Error loading saved form data:', error)
      }
    }
  }, [])

  // Save to localStorage whenever form data changes
  useEffect(() => {
    localStorage.setItem('taotter-mvp-form-data', JSON.stringify(formData))
  }, [formData])

  // Form options
  const stageOptions = [
    { value: '', label: 'Select Stage' },
    { value: 'idea', label: 'Idea' },
    { value: 'validation', label: 'Validation' },
    { value: 'growth', label: 'Growth' }
  ]

  const timelineOptions = [
    { value: '', label: 'Select Timeline' },
    { value: '1-2 weeks', label: '1-2 weeks' },
    { value: '3-4 weeks', label: '3-4 weeks' },
    { value: '1-2 months', label: '1-2 months' },
    { value: '3-6 months', label: '3-6 months' },
    { value: '6+ months', label: '6+ months' }
  ]

  const handleBudgetBlur = () => {
    const val = formData.budgetRange.trim()
    if (val && !val.toLowerCase().includes('qar')) {
      updateFormData('budgetRange', val + ' QAR')
    }
  }

  // Handle form field updates
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

  // Validation functions
  const validateStep1 = () => {
    const newErrors = {}
    
    if (!formData.startupName.trim()) newErrors.startupName = 'Startup name is required'
    if (!formData.taskName.trim()) newErrors.taskName = 'Task name is required'  
    
    // Task description validation with minimum 10 characters
    if (!formData.taskDescription.trim()) {
      newErrors.taskDescription = 'Task description is required'
    } else if (formData.taskDescription.trim().length < 10) {
      newErrors.taskDescription = 'Task description must be at least 10 characters long'
    }
    
    if (!formData.stage) newErrors.stage = 'Please select a stage'
    
    // Key goals validation with minimum 10 characters
    if (!formData.keyGoals.trim()) {
      newErrors.keyGoals = 'Key goals are required'
    } else if (formData.keyGoals.trim().length < 10) {
      newErrors.keyGoals = 'Key goals must be at least 10 characters long'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}

    if (!formData.timeline.trim()) newErrors.timeline = 'Timeline is required'
    if (!formData.budgetRange.trim()) newErrors.budgetRange = 'Please enter a budget range'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors = {}

    if (!formData.customRequest.trim()) {
      newErrors.customRequest = 'Additional Information is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Navigation handlers
  const handleNext = () => {
    let isValid = false
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1()
        break
      case 2:
        isValid = validateStep2()
        break
      case 3:
        isValid = validateStep3()
        break
      default:
        isValid = true
    }
    
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else if (isValid && currentStep === 3) {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Form submission
  const handleSubmit = async () => {
    if (!validateStep3()) return
    
    setIsSubmitting(true)
    
    try {
      // Map frontend fields to backend schema
      const questionnaireData = {
        basicInfo: {
          startupName: formData.startupName,
          taskType: 'mvp-development', // Default or derive as needed
          taskDescription: formData.taskDescription,
          startupStage: formData.stage || 'idea',
          keyGoals: formData.keyGoals,
          timeCommitment: formData.timeCommitment,
        },
        requirements: {
          milestones: [],
          customMilestone: '',
          timeline: formData.timeline,
          budgetRange: formData.budgetRange,
          additionalRequirements: ''
        },
        serviceSelection: {
          selectedService: '',
          customRequest: formData.customRequest,
          isCustom: true,
          urgency: 'medium'
        }
      };

      // Use RTK Query mutation
      const response = await createQuestionnaire(questionnaireData).unwrap();

      // Store temporaryId for linking after signup
      if (response?.data?.questionnaire?.temporaryId) {
        localStorage.setItem('taotter-mvp-temporary-id', response.data.questionnaire.temporaryId);
      }

      localStorage.removeItem('taotter-mvp-form-data');
      navigate('/signup');
      
    } catch (error) {
      console.error('Error submitting form:', error)
      // Handle error state
    } finally {
      setIsSubmitting(false)
    }
  }

  const getButtonText = () => {
    if (currentStep === 3) {
      return isSubmitting ? 'Starting Sprint...' : 'Start Sprint'
    }
    return 'Next'
  }

  return (
    <div className="mvp-form-page">
      {isMobile ? (
        <>
        
          <div className="mvp-mobile-header">
            <div className="mvp-mobile-header-title">
              {"What's\nYour Startup\nIdea?"}
            </div>
          </div>
        <div className="mvp-mobile-container">
          <div className="mvp-mobile-title">
            {"Tell Us About Your\nStartup"}
          </div>
          {/* Render the rest of the form as usual */}
          {/* Step 1 */}
          {currentStep === 1 && (
            <>
              <div className="mvp-form-row">
                <div className="mvp-form-col">
                  <label className="mvp-form-label" htmlFor="startupName">Startup Name</label>
                  <input
                    id="startupName"
                    className="mvp-form-input"
                    value={formData.startupName}
                    onChange={(e) => updateFormData('startupName', e.target.value)}
                    placeholder="Enter Name"
                    required
                  />
                  {errors.startupName && <div className="error-message">{errors.startupName}</div>}
                </div>
                <div className="mvp-form-col">
                  <label className="mvp-form-label" htmlFor="taskName">Task Name</label>
                  <input
                    id="taskName"
                    className="mvp-form-input"
                    value={formData.taskName}
                    onChange={(e) => updateFormData('taskName', e.target.value)}
                    placeholder="Enter Task Name"
                    required
                  />
                  {errors.taskName && <div className="error-message">{errors.taskName}</div>}
                </div>
              </div>
              <div className="mvp-form-row">
                <div className="mvp-form-col">
                  <label className="mvp-form-label" htmlFor="taskDescription">Task Description</label>
                  <input
                    id="taskDescription"
                    className="mvp-form-input"
                    value={formData.taskDescription}
                    onChange={(e) => updateFormData('taskDescription', e.target.value)}
                    placeholder="Give us a brief of the task (minimum 10 characters)"
                    required
                  />
                  {errors.taskDescription && <div className="error-message">{errors.taskDescription}</div>}
                </div>
                <div className="mvp-form-col">
                  <label className="mvp-form-label" htmlFor="stage">Stage</label>
                  <select
                    id="stage"
                    className="mvp-form-input"
                    value={formData.stage}
                    onChange={(e) => updateFormData('stage', e.target.value)}
                    required
                  >
                    {stageOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {errors.stage && <div className="error-message">{errors.stage}</div>}
                </div>
              </div>
              <div className="mvp-form-keygoals-row">
                <label className="mvp-form-label" htmlFor="keyGoals">Key Goals</label>
                <textarea
                  id="keyGoals"
                  className="mvp-form-keygoals-input"
                  value={formData.keyGoals}
                  onChange={(e) => updateFormData('keyGoals', e.target.value)}
                  placeholder="e.g. Build MVP, Get First Users (minimum 10 characters)"
                  required
                  rows={3}
                />
                {errors.keyGoals && <div className="error-message">{errors.keyGoals}</div>}
              </div>
              <div className="mvp-form-radio-row">
                <label className="mvp-form-radio-label">
                  How much time are you dedicating to your startup?
                </label>
                <div className="mvp-form-radio-options">
                  <label className="mvp-form-radio-btn">
                    <input
                      type="radio"
                      name="timeCommitment"
                      value="full-time"
                      checked={formData.timeCommitment === 'full-time'}
                      onChange={() => updateFormData('timeCommitment', 'full-time')}
                    />
                    <span className="mvp-form-radio-btn-label">Full-time</span>
                  </label>
                  <label className="mvp-form-radio-btn">
                    <input
                      type="radio"
                      name="timeCommitment"
                      value="part-time"
                      checked={formData.timeCommitment === 'part-time'}
                      onChange={() => updateFormData('timeCommitment', 'part-time')}
                    />
                    <span className="mvp-form-radio-btn-label">Part-time</span>
                  </label>
                </div>
              </div>
              <button
                className="mvp-form-next-btn"
                onClick={handleNext}
                disabled={isSubmitting}
                style={{ background: "#EB5E28" }}
              >
                Next
              </button>
            </>
          )}
          {/* Step 2 */}
          {currentStep === 2 && (
            <>
              <div className="mvp-form-row">
                <div className="mvp-form-col">
                  <label className="mvp-form-label" htmlFor="timeline">Timeline in Mind?</label>
                  <select
                    id="timeline"
                    className="mvp-form-input mvp-form-input-wide"
                    value={formData.timeline}
                    onChange={(e) => updateFormData('timeline', e.target.value)}
                    required
                  >
                    {timelineOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {errors.timeline && <div className="error-message">{errors.timeline}</div>}
                </div>
              </div>
              <div className="mvp-form-row">
                <div className="mvp-form-col">
                  <label className="mvp-form-label" htmlFor="budgetRange">Budget Range</label>
                  <input
                    id="budgetRange"
                    className="mvp-form-input mvp-form-input-wide"
                    value={formData.budgetRange}
                    onChange={(e) => updateFormData('budgetRange', e.target.value)}
                    onBlur={handleBudgetBlur}
                    placeholder="Enter an estimated budget (in QAR)"
                    required
                  />
                  {errors.budgetRange && <div className="error-message">{errors.budgetRange}</div>}
                </div>
              </div>
              <div className="mvp-form-btn-row">
                <button
                  className="mvp-form-btn-back"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                >
                  Back
                </button>
                <button
                  className="mvp-form-btn-next"
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  Next
                </button>
              </div>
            </>
          )}
          {/* Step 3 */}
          {currentStep === 3 && (
            <>
              <div className="mvp-form-row">
                <div className="mvp-form-col">
                  <label className="mvp-form-label" htmlFor="customRequest">
                    Additional Information
                    <div style={{ fontSize: 12, fontWeight: 400, color: "#AAAAAA", marginTop: 4 }}>
                      Tell us what else do you need and we will set the right tools for you.
                    </div>
                  </label>
                  <input
                    id="customRequest"
                    className="mvp-form-input mvp-form-input-wide"
                    value={formData.customRequest}
                    onChange={(e) => updateFormData('customRequest', e.target.value)}
                    placeholder="Enter any additional information or requirements here."
                    required
                  />
                  {errors.customRequest && <div className="error-message">{errors.customRequest}</div>}
                </div>
              </div>
              <div className="mvp-form-btn-row">
                <button
                  className="mvp-form-btn-back"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                >
                  Back
                </button>
                <button
                  className="mvp-form-btn-start"
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Starting Sprint...' : 'Start Sprint'}
                </button>
              </div>
            </>
          )}
        </div>
        </>
      ) : (
        <div className="mvp-form-split-container">
          {/* Left: Form */}
          <div className="mvp-form-left">
            <div className="mvp-form-title">
              {currentStep === 1 && "Tell us about your startup"}
              {currentStep === 2 && "Set Your Timeline and Budget"}
              {currentStep === 3 && "Extras"}
            </div>
            <div className="mvp-form-progress-bar">
              {[1, 2, 3].map((step, idx) => (
                <div key={step} style={{ display: "flex", alignItems: "center" }}>
                  <div
                    className={
                      "mvp-form-progress-step" +
                      (currentStep === step
                        ? " active"
                        : currentStep > step
                        ? " completed"
                        : "")
                    }
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div className="mvp-form-progress-line" />
                  )}
                </div>
              ))}
            </div>
            {/* Step 1 */}
            {currentStep === 1 && (
              <>
                <div className="mvp-form-row">
                  <div className="mvp-form-col">
                    <label className="mvp-form-label" htmlFor="startupName">Startup Name</label>
                    <input
                      id="startupName"
                      className="mvp-form-input"
                      value={formData.startupName}
                      onChange={(e) => updateFormData('startupName', e.target.value)}
                      placeholder="Enter Name"
                      required
                    />
                    {errors.startupName && <div className="error-message">{errors.startupName}</div>}
                  </div>
                  <div className="mvp-form-col">
                    <label className="mvp-form-label" htmlFor="taskName">Task Name</label>
                    <input
                      id="taskName"
                      className="mvp-form-input"
                      value={formData.taskName}
                      onChange={(e) => updateFormData('taskName', e.target.value)}
                      placeholder="Enter Task Name"
                      required
                    />
                    {errors.taskName && <div className="error-message">{errors.taskName}</div>}
                  </div>
                </div>
                <div className="mvp-form-row">
                  <div className="mvp-form-col">
                    <label className="mvp-form-label" htmlFor="taskDescription">Task Description</label>
                    <input
                      id="taskDescription"
                      className="mvp-form-input"
                      value={formData.taskDescription}
                      onChange={(e) => updateFormData('taskDescription', e.target.value)}
                      placeholder="Give us a brief of the task (minimum 10 characters)"
                      required
                    />
                    {errors.taskDescription && <div className="error-message">{errors.taskDescription}</div>}
                  </div>
                  <div className="mvp-form-col">
                    <label className="mvp-form-label" htmlFor="stage">Stage</label>
                    <select
                      id="stage"
                      className="mvp-form-input"
                      value={formData.stage}
                      onChange={(e) => updateFormData('stage', e.target.value)}
                      required
                    >
                      {stageOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {errors.stage && <div className="error-message">{errors.stage}</div>}
                  </div>
                </div>
                <div className="mvp-form-keygoals-row">
                  <label className="mvp-form-label" htmlFor="keyGoals">Key Goals</label>
                  <textarea
                    id="keyGoals"
                    className="mvp-form-keygoals-input"
                    value={formData.keyGoals}
                    onChange={(e) => updateFormData('keyGoals', e.target.value)}
                    placeholder="e.g. Build MVP, Get First Users (minimum 10 characters)"
                    required
                    rows={3}
                  />
                  {errors.keyGoals && <div className="error-message">{errors.keyGoals}</div>}
                </div>
                <div className="mvp-form-radio-row">
                  <label className="mvp-form-radio-label">
                    How much time are you dedicating to your startup?
                  </label>
                  <div className="mvp-form-radio-options">
                    <label className="mvp-form-radio-btn">
                      <input
                        type="radio"
                        name="timeCommitment"
                        value="full-time"
                        checked={formData.timeCommitment === 'full-time'}
                        onChange={() => updateFormData('timeCommitment', 'full-time')}
                      />
                      <span className="mvp-form-radio-btn-label">Full-time</span>
                    </label>
                    <label className="mvp-form-radio-btn">
                      <input
                        type="radio"
                        name="timeCommitment"
                        value="part-time"
                        checked={formData.timeCommitment === 'part-time'}
                        onChange={() => updateFormData('timeCommitment', 'part-time')}
                      />
                      <span className="mvp-form-radio-btn-label">Part-time</span>
                    </label>
                  </div>
                </div>
                <button
                  className="mvp-form-next-btn"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  style={{ background: "#EB5E28" }}
                >
                  Next
                </button>
              </>
            )}
            {/* Step 2 */}
            {currentStep === 2 && (
              <>
                <div className="mvp-form-row">
                  <div className="mvp-form-col">
                    <label className="mvp-form-label" htmlFor="timeline">Timeline in Mind?</label>
                    <select
                      id="timeline"
                      className="mvp-form-input mvp-form-input-wide"
                      value={formData.timeline}
                      onChange={(e) => updateFormData('timeline', e.target.value)}
                      required
                    >
                      {timelineOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {errors.timeline && <div className="error-message">{errors.timeline}</div>}
                  </div>
                </div>
                <div className="mvp-form-row">
                  <div className="mvp-form-col">
                    <label className="mvp-form-label" htmlFor="budgetRange">Budget Range</label>
                    <input
                      id="budgetRange"
                      className="mvp-form-input mvp-form-input-wide"
                      value={formData.budgetRange}
                      onChange={(e) => updateFormData('budgetRange', e.target.value)}
                      onBlur={handleBudgetBlur}
                      placeholder="Enter an estimated budget (in QAR)"
                      required
                    />
                    {errors.budgetRange && <div className="error-message">{errors.budgetRange}</div>}
                  </div>
                </div>
                <div className="mvp-form-btn-row">
                  <button
                    className="mvp-form-btn-back"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                  >
                    Back
                  </button>
                  <button
                    className="mvp-form-btn-next"
                    onClick={handleNext}
                    disabled={isSubmitting}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
            {/* Step 3 */}
            {currentStep === 3 && (
              <>
                <div className="mvp-form-row">
                  <div className="mvp-form-col">
                    <label className="mvp-form-label" htmlFor="customRequest">
                      Additional Information
                      <div style={{ fontSize: 12, fontWeight: 400, color: "#AAAAAA", marginTop: 4 }}>
                        Tell us what else do you need and we will set the right tools for you.
                      </div>
                    </label>
                    <input
                      id="customRequest"
                      className="mvp-form-input mvp-form-input-wide"
                      value={formData.customRequest}
                      onChange={(e) => updateFormData('customRequest', e.target.value)}
                      placeholder="Enter any additional information or requirements here."
                      required
                    />
                    {errors.customRequest && <div className="error-message">{errors.customRequest}</div>}
                  </div>
                </div>
                <div className="mvp-form-btn-row">
                  <button
                    className="mvp-form-btn-back"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                  >
                    Back
                  </button>
                  <button
                    className="mvp-form-btn-start"
                    onClick={handleNext}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Starting Sprint...' : 'Start Sprint'}
                  </button>
                </div>
              </>
            )}
          </div>
          {/* Right: Image */}
          <div className="mvp-form-right">
            <img
              src={formImage}
              alt="Form Visual"
              className="mvp-form-image"
            />
          </div>
        </div>
      )}
      {/* WhatsApp Float */}
      <div className="whatsapp-float">
        <div className="whatsapp-button">
          {/* Icon removed for brevity */}
        </div>
      </div>
    </div>
  )
}

export default MvpFormPage
