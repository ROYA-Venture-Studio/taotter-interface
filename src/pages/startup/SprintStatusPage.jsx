import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetCurrentUserQuery } from '../../store/api/authApi'
import { useGetSprintsQuery, useGetMySprintsQuery } from '../../store/api/sprintsApi'
import hangImage from '../../assets/images/hang.png'
import longImage from '../../assets/images/long.png'
import './SprintStatusPage.css'

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

const SprintStatusPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate()
  const { data: userData, isLoading: userLoading } = useGetCurrentUserQuery()
  const [showSprints, setShowSprints] = useState(false)
  const [sprintData, setSprintData] = useState(null)

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
          packageOptions: s.packageOptions || []
        }))
      })
    }
  }, [sprintsData, userData])

  const handleGetStarted = (sprint) => {
    // Navigate to step 1 (document upload) first
    navigate(`/sprint/${sprint.id}/onboarding/step-1`)
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

  // "Hang tight" screen with special full background image for desktop
  if (onboardingStep === 'pending_review') {
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
            </div>
          </>
        ) : (
          <div className="hang-tight-fullscreen">
            <div className="hang-tight-content">
              <div className="hang-tight-text">
                <p>We're reviewing your application</p>
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

    // Sprint is approved - show sprint selection with long.png image
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
                    </div>
                    <div className="sprint-action">
                      <button
                        className="sprint-get-started-btn"
                        onClick={() => handleGetStarted(sprint)}
                      >
                        Let's Get Started ----&gt;
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
                    </div>
                    <div className="sprint-action">
                      <button
                        className="sprint-get-started-btn"
                        onClick={() => handleGetStarted(sprint)}
                      >
                        Let's Get Started ----&gt;
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

  // If user has active sprints but is on sprint status page, show a message
  if (mySprintsData && mySprintsData.data && mySprintsData.data.sprints && mySprintsData.data.sprints.length > 0) {
    const activeSprint = mySprintsData.data.sprints[0]
    return (
      <div className="sprint-status-page">
        {isMobile ? (
          <>
            <div className="sprint-status-mobile-header">
              <div className="sprint-status-mobile-header-title">
                Sprint In Progress
              </div>
            </div>
            <div className="sprint-status-mobile-container">
              <div className="sprint-status-mobile-title">
                You have an active sprint!
              </div>
              <p>Continue with your current sprint or go to your dashboard.</p>
              <div className="sprint-navigation-buttons">
                <button 
                  className="sprint-get-started-btn"
                  onClick={() => navigate('/startup/dashboard')}
                >
                  Go to Dashboard
                </button>
                <button 
                  className="sprint-get-started-btn"
                  onClick={() => navigate(`/startup/sprint/${activeSprint.id}/board`)}
                >
                  View Sprint Board
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="sprint-status-split-container">
            <div className="sprint-status-left">
              <div className="sprint-status-form-title">
                Sprint In Progress
              </div>
              <div className="sprint-status-form-subtitle">
                You have an active sprint!
              </div>
              <p>Continue with your current sprint or go to your dashboard.</p>
              <div className="sprint-navigation-buttons">
                <button 
                  className="sprint-get-started-btn"
                  onClick={() => navigate('/startup/dashboard')}
                >
                  Go to Dashboard
                </button>
                <button 
                  className="sprint-get-started-btn"
                  onClick={() => navigate(`/startup/sprint/${activeSprint.id}/board`)}
                >
                  View Sprint Board
                </button>
              </div>
            </div>
            <div className="sprint-status-right">
              <img
                src={longImage}
                alt="Sprint In Progress"
                className="sprint-status-image"
              />
            </div>
          </div>
        )}
      </div>
    )
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
