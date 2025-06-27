import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui'
import { useScheduleMeetingMutation } from '../../store/api/sprintsApi'
import './SprintOnboardingStep3.css'

const SprintOnboardingStep3 = () => {
  const navigate = useNavigate()
  const { sprintId } = useParams()
  const [isScheduled, setIsScheduled] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [meetingDetails, setMeetingDetails] = useState(null)
  const iframeRef = useRef(null)
  const [showIframe, setShowIframe] = useState(false)
  
  const [scheduleMeeting] = useScheduleMeetingMutation()

  const calendlyUrl = 'https://calendly.com/taotter/kickoff-call'

  useEffect(() => {
    const handleCalendlyMessage = (event) => {
      if (event.origin !== 'https://calendly.com') return

      if (event.data.event && event.data.event === 'calendly.event_scheduled') {
        const eventData = event.data.event_details
        setMeetingDetails({
          eventUri: eventData.uri,
          eventName: eventData.event_type.name,
          startTime: eventData.start_time,
          endTime: eventData.end_time,
          inviteeEmail: eventData.invitee.email,
          inviteeName: eventData.invitee.name,
          scheduledAt: new Date().toISOString()
        })
        setIsScheduled(true)
        setShowIframe(false)
      }

      if (event.data.event && event.data.event === 'calendly.profile_page_viewed') {
        console.log('User is viewing Calendly calendar')
      }

      if (event.data.event && event.data.event === 'calendly.date_and_time_selected') {
        console.log('User selected a date and time')
      }
    }

    window.addEventListener('message', handleCalendlyMessage)

    return () => {
      window.removeEventListener('message', handleCalendlyMessage)
    }
  }, [])

  const handleScheduleCall = () => {
    setShowIframe(true)
  }

  const handleCloseIframe = () => {
    setShowIframe(false)
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
      <div className="sprint-onboarding-card schedule-card">
        <div className="sprint-onboarding-header">
          <h1>Start Your Sprint</h1>
        </div>
        
        <div className="sprint-onboarding-content">
          <div className="onboarding-title">
            <h2>Schedule a kickoff call to align on goals, deliverables, and timelines</h2>
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
                <Button
                  variant="primary"
                  onClick={handleScheduleCall}
                  className="schedule-button"
                  size="large"
                >
                  Schedule with Calendly
                </Button>
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
              onClick={handleFinish}
              disabled={!isScheduled || isSubmitting}
              className="nav-button finish-button"
            >
              {isSubmitting ? 'Completing...' : 'Finish'}
            </Button>
          </div>
        </div>
      </div>

      {showIframe && (
        <div className="calendly-modal-overlay">
          <div className="calendly-modal">
            <div className="calendly-modal-header">
              <h3>Schedule Your Kickoff Call</h3>
              <button className="calendly-close-btn" onClick={handleCloseIframe}>
                ×
              </button>
            </div>
            <div className="calendly-iframe-container">
              <iframe
                ref={iframeRef}
                src={`${calendlyUrl}?embed_domain=${window.location.hostname}&embed_type=Inline`}
                width="100%"
                height="600"
                frameBorder="0"
                title="Schedule Kickoff Call"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SprintOnboardingStep3
