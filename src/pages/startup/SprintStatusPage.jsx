import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetCurrentUserQuery } from '../../store/api/authApi'
import { useGetSprintsQuery, useGetMySprintsQuery } from '../../store/api/sprintsApi'
import './SprintStatusPage.css'

const SprintStatusPage = () => {
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

  // REMOVED: Smart routing that was causing redirect loops
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
    // Navigate to step 1 - no package selection here!
    // Let the user choose their package in step 2
    navigate(`/sprint/${sprint.id}/onboarding/step-1`)
  }

  if (userLoading || mySprintsLoading) {
    return (
      <div className="sprint-status-page">
        <div className="sprint-status-card">
          <div className="sprint-status-header">
            <h1>Start Your Sprint</h1>
          </div>
          <div className="sprint-status-content">
            <h2>Loading...</h2>
            <p>Checking your sprint status...</p>
          </div>
        </div>
      </div>
    )
  }

  const onboardingStep = userData?.data?.user?.onboarding?.currentStep

  if (onboardingStep === 'pending_review') {
    return (
      <div className="sprint-status-page">
        <div className="sprint-status-card">
          <div className="sprint-status-header">
            <h1>Start Your Sprint</h1>
          </div>
          <div className="sprint-status-content">
            <h2>Hang tight your request is being processed.</h2>
          </div>
        </div>
      </div>
    )
  }

  if (onboardingStep === 'sprint_selection') {
    if (sprintsLoading || !sprintData) {
      return (
        <div className="sprint-status-page">
          <div className="sprint-status-card">
            <div className="sprint-status-header">
              <h1>Start Your Sprint</h1>
            </div>
            <div className="sprint-status-content">
              <h2>Loading sprints...</h2>
            </div>
          </div>
        </div>
      )
    }

    // Sprint is approved - show sprint selection
    return (
      <div className="sprint-status-page">
        <div className="sprint-status-card sprint-approved">
          <div className="sprint-status-header">
            <h1>Start Your Sprint</h1>
          </div>
          <div className="sprint-status-content">
            <h2>Select Your Sprint</h2>
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
        </div>
      </div>
    )
  }

  // If user has active sprints but is on sprint status page, show a message
  if (mySprintsData && mySprintsData.data && mySprintsData.data.sprints && mySprintsData.data.sprints.length > 0) {
    const activeSprint = mySprintsData.data.sprints[0]
    return (
      <div className="sprint-status-page">
        <div className="sprint-status-card">
          <div className="sprint-status-header">
            <h1>Sprint In Progress</h1>
          </div>
          <div className="sprint-status-content">
            <h2>You have an active sprint!</h2>
            <p>Continue with your current sprint or go to your dashboard.</p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
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
        </div>
      </div>
    )
  }

  // Default fallback
  return (
    <div className="sprint-status-page">
      <div className="sprint-status-card">
        <div className="sprint-status-header">
          <h1>Start Your Sprint</h1>
        </div>
        <div className="sprint-status-content">
          <h2>Loading...</h2>
        </div>
      </div>
    </div>
  )
}

export default SprintStatusPage
