import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetCurrentUserQuery, useSetOnboardingStepMutation } from '../../store/api/authApi'
import { useGetQuestionnairesQuery, useScheduleMeetingMutation } from '../../store/api/questionnairesApi'
import hangImage from '../../assets/images/hang.png'
import longImage from '../../assets/images/long.png'
import { Button } from '../../components/ui'
import './SprintStatusPage.css'
import { useGetSprintsQuery, useGetMySprintsQuery } from '../../store/api/sprintsApi'
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

const calendlyUrl = 'https://calendly.com/taottertest';

const SprintStatusPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate()
  const { data: userData, isLoading: userLoading } = useGetCurrentUserQuery()
  const { data: questionnairesData, isLoading: questionnairesLoading } = useGetQuestionnairesQuery()
  const [showSprints, setShowSprints] = useState(false)
  const [sprintData, setSprintData] = useState(null)
  const [calendlyClicked, setCalendlyClicked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scheduleMeeting] = useScheduleMeetingMutation()
  const [setOnboardingStep] = useSetOnboardingStepMutation();

  // Get the latest questionnaire for the current user
  const latestQuestionnaire = questionnairesData?.data?.questionnaires?.[0] || null
  const questionnaireId = latestQuestionnaire?.id

  // Fetch available sprints only if onboarding step is 'sprint_selection'
  const { data: sprintsData, isLoading: sprintsLoading } = useGetSprintsQuery(
    {},
    { skip: !showSprints }
  )
  
  // Always fetch user's current sprints to check for active ones
  const { data: mySprintsData, isLoading: mySprintsLoading } = useGetMySprintsQuery({})

  // Only set showSprints based on onboarding step
  useEffect(() => {
    if (userData && userData.data && userData.data.user && userData.data.user.onboarding) {
      const step = userData.data.user.onboarding.currentStep
      
      // If step is sprint_selection, show sprint selection
      if (step === 'sprint_selection') {
        setShowSprints(true)
      } else {
        setShowSprints(false)
      }
    }
  }, [userData])

  useEffect(() => {
    if (sprintsData && sprintsData.data && sprintsData.data.sprints) {
      setSprintData({
        projectName: userData?.data?.user?.profile?.companyName || 'Your Project',
        sprints: sprintsData.data.sprints.map((s, idx) => ({
          id: s.id,
          number: idx + 1,
          title: s.name,
          estimatedWeeks: s.estimatedDuration || 0,
          objective: s.packageOptions?.[0]?.description || 'No objective available',
          deliverables: s.description || 'No deliverables specified',
          estimatedTotalHours: (s.estimatedDuration || 0) * 30, // weeks * 5 days * 6 hours
          // REMOVE packageOptions from here for selection screen
        }))
      })
    }
  }, [sprintsData, userData])

  const handleGetStarted = (sprint) => {
    // Navigate to step 1 (document upload) first
    navigate(`/sprint/${sprint.id}/onboarding/step-1`)
  }

  // Find the pending sprint (the one in onboarding)
  const pendingSprint =
    mySprintsData?.data?.sprints?.find(
      (s) => s.status === 'documents_submitted' || s.status === 'meeting_scheduled'
    ) || null;

  // Determine if meeting is already scheduled
  const meetingAlreadyScheduled = pendingSprint?.status === 'meeting_scheduled';

  const handleScheduleCall = async () => {
    setCalendlyClicked(true)
    const calendlyWindow = window.open(
      calendlyUrl,
      'calendly',
      'width=800,height=600,scrollbars=yes,resizable=yes'
    )
    if (calendlyWindow) {
      calendlyWindow.focus()
    }
    alert('Please complete your scheduling in the new window/tab. Once you have scheduled your meeting, return here. You will not be able to schedule again.');
    // Optionally, you could POST to /api/sprints/:id/schedule-meeting here if you have the sprintId
    if (pendingSprint && !meetingAlreadyScheduled) {
      setIsSubmitting(true)
      try {
        await scheduleMeeting({
          id: pendingSprint.id,
          meetingUrl: calendlyUrl,
          scheduledAt: new Date().toISOString(),
          meetingType: 'kickoff'
        }).unwrap()
      } catch (error) {
        // ignore error, since Calendly sends email anyway
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  if (userLoading || mySprintsLoading) {
    return (
      <div className="sprint-status-page">
        {isMobile ? (
          <>
            <div className="sprint-status-mobile-header">
              <div className="sprint-status-mobile-header-title">
                Start Your Sprint
              </div>
            </div>
            <div className="sprint-status-mobile-container">
              <div className="sprint-status-mobile-title">
                Loading...
              </div>
              <p>Checking your sprint status...</p>
            </div>
          </>
        ) : (
          <div className="sprint-status-split-container">
            <div className="sprint-status-left">
              <div className="sprint-status-form-title">
                Start Your Sprint
              </div>
              <div className="sprint-status-form-subtitle">
                Checking your sprint status...
              </div>
            </div>
            <div className="sprint-status-right">
              <img
                src={longImage}
                alt="Sprint Loading"
                className="sprint-status-image"
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  const onboardingStep = userData?.data?.user?.onboarding?.currentStep

  // "Hang tight" screen with Calendly scheduling (questionnaire-based)
  if (onboardingStep === 'pending_review' && latestQuestionnaire) {
    const meetingAlreadyScheduled = latestQuestionnaire.status === 'meeting_scheduled';

    const handleQuestionnaireScheduleCall = async () => {
      setCalendlyClicked(true)
      const calendlyWindow = window.open(
        calendlyUrl,
        'calendly',
        'width=800,height=600,scrollbars=yes,resizable=yes'
      )
      if (calendlyWindow) {
        calendlyWindow.focus()
      }
      alert('Please complete your scheduling in the new window/tab. Once you have scheduled your meeting, return here. You will not be able to schedule again.');
      if (questionnaireId && !meetingAlreadyScheduled) {
        setIsSubmitting(true)
        try {
          console.log("Scheduling meeting for questionnaireId:", questionnaireId)
          const result = await scheduleMeeting({ id: questionnaireId }).unwrap()
          console.log("Schedule meeting API result:", result)
        } catch (error) {
          console.error("Schedule meeting API error:", error)
        } finally {
          setIsSubmitting(false)
        }
      } else {
        console.warn("No questionnaireId or meeting already scheduled", { questionnaireId, meetingAlreadyScheduled })
      }
    };

    return (
      <div className="sprint-status-page">
        {isMobile ? (
          <>
            <div className="sprint-status-mobile-header">
              <div className="sprint-status-mobile-header-title">
                Start Your Sprint
              </div>
            </div>
            <div className="sprint-status-mobile-container">
              <div className="sprint-status-mobile-title">
                Hang tight your request is being processed
              </div>
              <div className="calendly-section">
                <p>
                  <strong>Schedule a kickoff call:</strong> To help us process your request faster, please schedule a kickoff call with our team.
                </p>
                <Button
                  variant="primary"
                  onClick={handleQuestionnaireScheduleCall}
                  className="schedule-button"
                  disabled={meetingAlreadyScheduled || isSubmitting}
                  style={{
                    display: 'block',
                    margin: '32px auto 0 auto',
                    textAlign: 'center'
                  }}
                >
                  {meetingAlreadyScheduled ? "You have already scheduled a meeting" : "Schedule with Calendly"}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="hang-tight-fullscreen">
            <div className="hang-tight-content">
              <div
                className="hang-tight-text"
                style={{
                  marginTop: '120px',
                  textAlign: 'center'
                }}
              >
                <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                  We're reviewing your application
                </p>
                <div className="calendly-section" style={{ marginTop: 64 }}>
                  <p>
                    <strong>Schedule a kickoff call:</strong> To help us process your request faster, please schedule a kickoff call with our team.
                  </p>
                  <Button
                    variant="primary"
                    onClick={handleQuestionnaireScheduleCall}
                    className="schedule-button"
                    disabled={meetingAlreadyScheduled || isSubmitting}
                    style={{
                      display: 'block',
                      margin: '40px auto 0 auto',
                      textAlign: 'center'
                    }}
                  >
                    {meetingAlreadyScheduled ? "You have already scheduled a meeting" : "Schedule with Calendly"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (onboardingStep === 'sprint_selection') {
    if (sprintsLoading || !sprintData) {
      return (
        <div className="sprint-status-page">
          {isMobile ? (
            <>
              <div className="sprint-status-mobile-header">
                <div className="sprint-status-mobile-header-title">
                  Start Your Sprint
                </div>
              </div>
              <div className="sprint-status-mobile-container">
                <div className="sprint-status-mobile-title">
                  Loading sprints...
                </div>
              </div>
            </>
          ) : (
            <div className="sprint-status-split-container">
              <div className="sprint-status-left">
                <div className="sprint-status-form-title">
                  Start Your Sprint
                </div>
                <div className="sprint-status-form-subtitle">
                  Loading sprints...
                </div>
              </div>
              <div className="sprint-status-right">
                <img
                  src={longImage}
                  alt="Sprint Loading"
                  className="sprint-status-image"
                />
              </div>
            </div>
          )}
        </div>
      )
    }

    // Handler for Pay Now
    const handlePayNow = async () => {
      try {
        await setOnboardingStep({ step: "payment_pending" }).unwrap();
      } catch (e) {
        // ignore error, user will still see payment pending page if payment not verified
      }
    };

    return (
      <div className="sprint-status-page">
        {isMobile ? (
          <>
            <div className="sprint-status-mobile-header">
              <div className="sprint-status-mobile-header-title">
                Start Your Sprint
              </div>
            </div>
            <div className="sprint-status-mobile-container">
              <div className="sprint-status-mobile-title">
                Select Your Sprint
              </div>
              <div className="sprint-options">
                {sprintData?.sprints.map((sprint) => (
                  <div key={sprint.id} className="sprint-option">
                    <div className="sprint-info">
                      <div className="sprint-project-name">Project: {sprintData.projectName}</div>
                      <div className="sprint-number">⚙ Sprint {sprint.number}</div>
                      <div className="sprint-title">{sprint.title}</div>
                      <div className="sprint-timeframe">Estimated Time: {sprint.estimatedWeeks} weeks</div>
                      <div className="sprint-objective">Sprint Objective: {sprint.objective}</div>
                      <div className="sprint-deliverables">
                        <strong>Deliverables:</strong>
                        <br />
                        {sprint.deliverables}
                      </div>
                      <div className="sprint-hours">⚠ Estimated Total Hours for Sprint {sprint.number}: {sprint.estimatedTotalHours} working hours</div>
                      {/* NO CREDIT TIERS OR PAYMENT STATUS HERE */}
                    </div>
                    <div className="sprint-action">
                      <button
                        className="sprint-get-started-btn"
                        onClick={() => handleGetStarted(sprint)}
                      >
                        {"Let's Get Started ---->"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="sprint-status-split-container">
            <div className="sprint-status-left">
              <div className="sprint-status-form-title">
                Select Your Sprint
              </div>
              <div className="sprint-status-form-subtitle">
                Choose from the available sprint options
              </div>
              <div className="sprint-options">
                {sprintData?.sprints.map((sprint) => (
                  <div key={sprint.id} className="sprint-option">
                    <div className="sprint-info">
                      <div className="sprint-project-name">Project: {sprintData.projectName}</div>
                      <div className="sprint-number">⚙ Sprint {sprint.number}</div>
                      <div className="sprint-title">{sprint.title}</div>
                      <div className="sprint-timeframe">Estimated Time: {sprint.estimatedWeeks} weeks</div>
                      <div className="sprint-objective">Sprint Objective: {sprint.objective}</div>
                      <div className="sprint-deliverables">
                        <strong>Deliverables:</strong>
                        <br />
                        {sprint.deliverables}
                      </div>
                      <div className="sprint-hours">⚠ Estimated Total Hours for Sprint {sprint.number}: {sprint.estimatedTotalHours} working hours</div>
                      {/* NO CREDIT TIERS OR PAYMENT STATUS HERE */}
                    </div>
                    <div className="sprint-action">
                      <button
                        className="sprint-get-started-btn"
                        onClick={() => handleGetStarted(sprint)}
                      >
                        {"Let's Get Started ---->"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="sprint-status-right">
              <img
                src={longImage}
                alt="Sprint Selection"
                className="sprint-status-image"
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  // If user has active sprints and all are paid, redirect to dashboard automatically
  if (mySprintsData && mySprintsData.data && mySprintsData.data.sprints && mySprintsData.data.sprints.length > 0) {
    const unpaidSprint = mySprintsData.data.sprints.find(
      (s) =>
        s.selectedPackage &&
        s.status === "package_selected" &&
        (s.selectedPackagePaymentStatus !== "paid" && s.selectedPackagePaymentStatus !== "PAID")
    );
    if (!unpaidSprint) {
      // All sprints are paid, redirect to dashboard
      useEffect(() => {
        navigate('/startup/dashboard', { replace: true });
      }, [navigate]);
      return null;
    }
    // If there are unpaid sprints, let the payment guard handle redirection
  }

  // Default fallback
  return (
    <div className="sprint-status-page">
      {isMobile ? (
        <>
          <div className="sprint-status-mobile-header">
            <div className="sprint-status-mobile-header-title">
              Start Your Sprint
            </div>
          </div>
          <div className="sprint-status-mobile-container">
            <div className="sprint-status-mobile-title">
              Loading...
            </div>
          </div>
        </>
      ) : (
        <div className="sprint-status-split-container">
          <div className="sprint-status-left">
            <div className="sprint-status-form-title">
              Start Your Sprint
            </div>
            <div className="sprint-status-form-subtitle">
              Loading...
            </div>
          </div>
          <div className="sprint-status-right">
            <img
              src={longImage}
              alt="Sprint Status"
              className="sprint-status-image"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default SprintStatusPage
