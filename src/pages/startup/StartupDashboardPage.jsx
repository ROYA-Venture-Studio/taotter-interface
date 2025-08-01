import React, { useState } from 'react'
import { Button } from '../../components/ui'
import { useGetMySprintsQuery } from '../../store/api/sprintsApi'
import { useGetStartupBoardBySprintQuery } from '../../store/api/boardsApi'
import { useFinishSprintMutation } from '../../store/api/sprintsApi'
import { useNavigate } from 'react-router-dom'
import './StartupDashboardPage.css'

const statusColors = {
  cancelled: 'cancelled',
  ongoing: 'ongoing',
  completed: 'completed',
  'in_progress': 'ongoing',
  'on_hold': 'cancelled',
  'package_selected': 'ongoing',
  'documents_submitted': 'ongoing',
  'meeting_scheduled': 'ongoing',
}

function getStatusLabel(status) {
  if (!status) return 'Ongoing'
  if (status === 'completed') return 'Completed'
  if (status === 'cancelled') return 'Cancelled'
  return 'Ongoing'
}

// Helper component for each sprint card
function SprintCard({ sprint, onNoBoardClick }) {
  const { data, isLoading, error } = useGetStartupBoardBySprintQuery(sprint.id, { skip: !sprint.id })
  const [showFinishModal, setShowFinishModal] = useState(false)
  const [finishSprint, { isLoading: isFinishing }] = useFinishSprintMutation()
  const navigate = useNavigate()
  let percent = 0;
  let allTasksDone = false;
  let totalTasks = 0;
  let doneTasks = 0;

  if (data && data.data && data.data.board) {
    const { columns, tasksByColumn } = data.data.board;
    // Gather all tasks
    const allTasks = Object.values(tasksByColumn || {}).flat();
    totalTasks = allTasks.length;
    doneTasks = allTasks.filter(task => task.status === 'done').length;
    allTasksDone = totalTasks > 0 && doneTasks === totalTasks;

    // For progress bar, keep old logic for now
    const completedColumn = columns.find(col => col.isCompleted);
    if (completedColumn && tasksByColumn) {
      const completedTasks = tasksByColumn[completedColumn._id] || [];
      const totalTasksBar = Object.values(tasksByColumn).reduce((sum, arr) => sum + arr.length, 0);
      percent = totalTasksBar > 0 ? Math.round((completedTasks.length / totalTasksBar) * 100) : 0;
    }
  }

  const handleFinishSprint = async (e) => {
    e.stopPropagation()
    try {
      await finishSprint({ id: sprint.id }).unwrap()
      setShowFinishModal(false)
    } catch (err) {
      // Optionally show error
      alert('Failed to finish sprint')
    }
  }

  const handleCardClick = () => {
    // Check if board exists before navigating
    if (error || !data?.data?.board) {
      // No board exists, show popup
      onNoBoardClick()
    } else {
      // Board exists, navigate to it
      navigate(`/startup/sprint/${sprint.id}/board`)
    }
  }

  return (
    <div
      className="dashboard-card"
      onClick={handleCardClick}
      tabIndex={0}
      role="button"
      style={{ outline: 'none' }}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCardClick()
        }
      }}
    >
      <div className="dashboard-card-header">
        <span className="dashboard-card-subtitle">{sprint.type ? sprint.type.charAt(0).toUpperCase() + sprint.type.slice(1) : 'Sprint'}</span>
        <div className="dashboard-card-status-row">
          <h3 className="dashboard-card-title">{sprint.name}</h3>
          <span className={`dashboard-status-pill ${statusColors[sprint.status] || 'ongoing'}`}>
            {getStatusLabel(sprint.status)}
          </span>
        </div>
      </div>
      <div className="dashboard-progress-row">
        <div className="dashboard-progress-bar-outer">
          <div
            className={`dashboard-progress-bar-inner ${statusColors[sprint.status] || 'ongoing'}`}
            style={{ width: `${isLoading ? 0 : percent}%` }}
          />
        </div>
        <span className="dashboard-progress-percent">
          {isLoading ? '...' : `${percent}%`}
        </span>
      </div>
      {/* REMOVED: Board error display - no longer showing error when no board exists */}
      {/* Finish Sprint Button */}
      {sprint.status !== 'completed' && (
        <Button
          type="button"
          variant="primary"
          className="dashboard-action-btn finish-btn"
          style={{ marginTop: 12, width: '100%' }}
          onClick={e => {
            e.stopPropagation()
            setShowFinishModal(true)
          }}
          disabled={
            isFinishing ||
            !allTasksDone ||
            (sprint.progress && sprint.progress.percentage !== 100)
          }
          title={
            !allTasksDone
              ? "All tasks must be marked as done to finish the sprint."
              : (sprint.progress && sprint.progress.percentage !== 100)
                ? "Sprint progress must be 100% to finish the sprint."
                : undefined
          }
        >
          {isFinishing ? 'Finishing...' : 'Finish Sprint'}
        </Button>
      )}
      {/* Modal for confirmation */}
      {showFinishModal && (
        <div className="dashboard-modal-backdrop">
          <div className="dashboard-modal">
            <h2>Are you sure you want to finish this sprint?</h2>
            <p className="dashboard-modal-subtitle">This action cannot be undone.</p>
            <div className="dashboard-modal-actions">
              <Button
                type="button"
                variant="secondary"
                className="dashboard-modal-btn"
                style={{ color: '#000' }}
                onClick={e => {
                  e.stopPropagation()
                  setShowFinishModal(false)
                }}
              >
                Close
              </Button>
              <Button
                type="button"
                variant="primary"
                className="dashboard-modal-btn"
                onClick={handleFinishSprint}
                disabled={isFinishing}
              >
                {isFinishing ? 'Finishing...' : 'Yes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const StartupDashboardPage = () => {
  const [showModal, setShowModal] = useState(false)
  const [showNoBoardModal, setShowNoBoardModal] = useState(false)
  const { data, isLoading, error } = useGetMySprintsQuery()
  const navigate = useNavigate()

  let sprintData = []
  if (data && data.data && data.data.sprints) {
    sprintData = data.data.sprints
  }

  return (
    <div className="dashboard-page">
      {/* Blue Top Section */}
      <div className="dashboard-top-section">
        <h1 className="dashboard-hero-title">Track Your Sprint</h1>
      </div>

      {/* Cards Section */}
      <div className="dashboard-cards-container">
        {isLoading && <div>Loading sprints...</div>}
        {error && <div style={{ color: 'red' }}>Failed to load sprints.</div>}
        {(!isLoading && sprintData.length === 0) && (
          <div>No active sprints found.</div>
        )}
        {sprintData.map((sprint, idx) => (
          <SprintCard
            key={sprint.id}
            sprint={sprint}
            onNoBoardClick={() => setShowNoBoardModal(true)}
          />
        ))}
      </div>

      {/* No Board Modal */}
      {showNoBoardModal && (
        <div className="dashboard-modal-backdrop">
          <div className="dashboard-modal">
            <h2>Board Not Available</h2>
            <p className="dashboard-modal-subtitle">
              The admin has not yet created a task board for this sprint.
            </p>
            <div className="dashboard-modal-actions">
              <Button
                type="button"
                variant="primary"
                className="dashboard-modal-btn"
                onClick={() => setShowNoBoardModal(false)}
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StartupDashboardPage
