import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui'
import { useScheduleMeetingMutation } from '../../store/api/sprintsApi'
import longImage from '../../assets/images/long.png'
import './SprintOnboardingStep3.css'

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

const SprintOnboardingStep3 = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate()
  const { sprintId } = useParams()
  const [isScheduled, setIsScheduled] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [meetingDetails, setMeetingDetails] = useState(null)
  const [calendlyClicked, setCalendlyClicked] = useState(false) // Track if Calendly button was clicked
  
  const [scheduleMeeting] = useScheduleMeetingMutation()

  const calendlyUrl = 'https://calendly.com/taottertest'

  const handleScheduleCall = () => {
    // Mark that Calendly button was clicked
    setCalendlyClicked(true)
    
    // Open Calendly in a new window/tab
    const calendlyWindow = window.open(
      calendlyUrl,
      'calendly',
      'width=800,height=600,scrollbars=yes,resizable=yes'
    )

    // Focus the new window
    if (calendlyWindow) {
      calendlyWindow.focus()
    }

    // Show instructions to user
    alert('Please complete your scheduling in the new window/tab. Once you have scheduled your meeting, come back here and click "I\'ve Scheduled My Meeting" below.')
  }

  const handleConfirmScheduled = () => {
    // Check if Calendly was opened first
    if (!calendlyClicked) {
      alert('Please use the "Schedule with Calendly" button first to open the scheduling page.')
      return
    }
    
    // Simulate meeting details for now
    const simulatedMeetingDetails = {
      eventUri: 'https://calendly.com/events/scheduled',
      eventName: 'Kickoff Call',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // Tomorrow + 30 mins
      inviteeEmail: 'user@example.com',
      inviteeName: 'User',
      scheduledAt: new Date().toISOString()
    }
    
    setMeetingDetails(simulatedMeetingDetails)
    setIsScheduled(true)
  }

  const handleFinish = async () => {
    if (!isScheduled || !meetingDetails) {
      alert('Please schedule your kickoff call before proceeding.')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await scheduleMeeting({
        id: sprintId,
        meetingUrl: meetingDetails.eventUri,
        scheduledAt: meetingDetails.startTime,
        meetingType: 'kickoff',
        meetingDetails: meetingDetails
      }).unwrap()
      
      navigate('/startup/dashboard')
      
    } catch (error) {
      console.error('Error scheduling meeting:', error)
      alert('Failed to save meeting details. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    navigate('/startup/dashboard')
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
              Schedule a kickoff call
            </div>
            <p>Align on goals, deliverables, and timelines</p>
            
            <div className="schedule-content">
              <div className="schedule-info">
                <div className="info-item">
                  <div className="info-icon">📅</div>
                  <div className="info-text">
                    <h3>Kickoff Call</h3>
                    <p>30-minute session to align on project goals and set expectations</p>
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-icon">🎯</div>
                  <div className="info-text">
                    <h3>What We'll Cover</h3>
                    <ul>
                      <li>Review your sprint objectives and deliverables</li>
                      <li>Discuss timelines and milestones</li>
                      <li>Clarify any questions about your startup materials</li>
                      <li>Set communication preferences and check-in schedule</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="schedule-action">
                {!isScheduled ? (
                  <div className="schedule-buttons">
                    <Button
                      variant="primary"
                      onClick={handleScheduleCall}
                      className="schedule-button"
                    >
                      Schedule with Calendly
                    </Button>
                    
                    {calendlyClicked && (
                      <div className="calendly-status">
                        ✓ Calendly opened! Once you've scheduled your meeting, click the button below.
                      </div>
                    )}
                    
                    <Button
                      variant="secondary"
                      onClick={handleConfirmScheduled}
                      disabled={!calendlyClicked}
                      className="confirm-button"
                    >
                      I've Scheduled My Meeting
                    </Button>
                  </div>
                ) : (
                  <div className="schedule-confirmation">
                    <div className="confirmation-icon">✅</div>
                    <div className="confirmation-text">
                      <h4>Call Scheduled!</h4>
                      <p>Meeting: {meetingDetails?.eventName}</p>
                      <p>Time: {formatDateTime(meetingDetails?.startTime)}</p>
                      <p>You'll receive a calendar invitation shortly. We're excited to start your sprint!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

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
                onClick={handleFinish}
                disabled={!isScheduled || isSubmitting}
                className="nav-button finish-button"
              >
                {isSubmitting ? 'Completing...' : 'Finish'}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="sprint-onboarding-split-container">
          <div className="sprint-onboarding-left">
            <div className="sprint-onboarding-form-title">
              Schedule a kickoff call
            </div>
            <div className="sprint-onboarding-form-subtitle">
              Align on goals, deliverables, and timelines
            </div>
            
            <div className="schedule-content">
              <div className="schedule-info">
                <div className="info-item">
                  <div className="info-icon">📅</div>
                  <div className="info-text">
                    <h3>Kickoff Call</h3>
                    <p>30-minute session to align on project goals and set expectations</p>
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-icon">🎯</div>
                  <div className="info-text">
                    <h3>What We'll Cover</h3>
                    <ul>
                      <li>Review your sprint objectives and deliverables</li>
                      <li>Discuss timelines and milestones</li>
                      <li>Clarify any questions about your startup materials</li>
                      <li>Set communication preferences and check-in schedule</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="schedule-action">
                {!isScheduled ? (
                  <div className="schedule-buttons">
                    <Button
                      variant="primary"
                      onClick={handleScheduleCall}
                      className="schedule-button"
                    >
                      Schedule with Calendly
                    </Button>
                    
                    {calendlyClicked && (
                      <div className="calendly-status">
                        ✓ Calendly opened! Once you've scheduled your meeting, click the button below.
                      </div>
                    )}
                    
                    <Button
                      variant="secondary"
                      onClick={handleConfirmScheduled}
                      disabled={!calendlyClicked}
                      className="confirm-button"
                    >
                      I've Scheduled My Meeting
                    </Button>
                  </div>
                ) : (
                  <div className="schedule-confirmation">
                    <div className="confirmation-icon">✅</div>
                    <div className="confirmation-text">
                      <h4>Call Scheduled!</h4>
                      <p>Meeting: {meetingDetails?.eventName}</p>
                      <p>Time: {formatDateTime(meetingDetails?.startTime)}</p>
                      <p>You'll receive a calendar invitation shortly. We're excited to start your sprint!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

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
                onClick={handleFinish}
                disabled={!isScheduled || isSubmitting}
                className="nav-button finish-button"
              >
                {isSubmitting ? 'Completing...' : 'Finish'}
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

export default SprintOnboardingStep3
