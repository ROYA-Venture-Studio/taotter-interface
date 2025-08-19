import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';
import { useGetMySprintsQuery } from '../../store/api/sprintsApi';
import { useGetStartupBoardBySprintQuery } from '../../store/api/boardsApi';
import { useFinishSprintMutation } from '../../store/api/sprintsApi';
import './StartupDashboardPage.css';

const statusColors = {
    cancelled: 'cancelled',
    ongoing: 'ongoing',
    completed: 'completed',
    'in_progress': 'ongoing',
    'on_hold': 'cancelled',
    'package_selected': 'ongoing',
    'documents_submitted': 'ongoing',
    'meeting_scheduled': 'ongoing',
};

function getStatusLabel(status) {
    if (!status) return 'Ongoing';
    if (status === 'completed') return 'Completed';
    if (status === 'cancelled') return 'Cancelled';
    return 'Ongoing';
}

function SprintDetails({ sprint }) {
    if (!sprint.selectedPackage) {
        return (
            <div className="sprint-details-container">
                <p>No package details available for this sprint.</p>
            </div>
        );
    }

    const { name, description, currency, engagementHours, hourlyRate, discount } = sprint.selectedPackage;
    const finalPrice = (hourlyRate * engagementHours) - (discount || 0);
    const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(finalPrice);
    const formattedDate = new Date(sprint.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="sprint-details-container">
            <h4 className="sprint-details-title">Sprint Details</h4>
            <div className="sprint-details-grid">
                <div className="details-column">
                    <div className="details-item">
                        <span className="details-label">Selected Package</span>
                        <p className="details-value">{name}</p>
                    </div>
                    <div className="details-item">
                        <span className="details-label">Task Description</span>
                        <p className="details-value">{description}</p>
                    </div>
                </div>
                <div className="details-column">
                    <div className="details-item">
                        <span className="details-label">Price</span>
                        <p className="details-value">{formattedPrice}</p>
                    </div>
                    <div className="details-item">
                        <span className="details-label">Date</span>
                        <p className="details-value">{formattedDate}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SprintCard({ sprint, onNoBoardClick }) {
    const { data, isLoading, error } = useGetStartupBoardBySprintQuery(sprint.id, { skip: !sprint.id });
    const [showFinishModal, setShowFinishModal] = useState(false);
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);
    const [finishSprint, { isLoading: isFinishing }] = useFinishSprintMutation();
    const navigate = useNavigate();
    let percent = 0;
    let allTasksDone = false;

    if (data && data.data && data.data.board) {
        const { columns, tasksByColumn } = data.data.board;
        const allTasks = Object.values(tasksByColumn || {}).flat();
        const doneTasks = allTasks.filter(task => task.status === 'done').length;
        allTasksDone = allTasks.length > 0 && doneTasks === allTasks.length;

        const completedColumn = columns.find(col => col.isCompleted);
        if (completedColumn && tasksByColumn) {
            const completedTasks = tasksByColumn[completedColumn._id] || [];
            const totalTasksBar = allTasks.length;
            percent = totalTasksBar > 0 ? Math.round((completedTasks.length / totalTasksBar) * 100) : 0;
        }
    }

    const handleFinishSprint = async (e) => {
        e.stopPropagation();
        try {
            await finishSprint({ id: sprint.id }).unwrap();
            setShowFinishModal(false);
        } catch (err) {
            alert('Failed to finish sprint');
        }
    };

    const handleCardClick = () => {
        if (error || !data?.data?.board) {
            onNoBoardClick();
        } else {
            navigate(`/startup/sprint/${sprint.id}/board`);
        }
    };
    
    const toggleDetails = (e) => {
        e.stopPropagation();
        setIsDetailsVisible(!isDetailsVisible);
    };

    const handleViewBoardClick = (e) => {
        e.stopPropagation();
        handleCardClick(); // Re-use the main card click logic
    };

    return (
        <div className="dashboard-card-wrapper">
            <div
                className="dashboard-card"
                onClick={handleCardClick}
                tabIndex={0}
                role="button"
                style={{ outline: 'none' }}
                onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        handleCardClick();
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
                
                <div className="dashboard-card-footer">
                    <button type="button" className="details-btn" onClick={toggleDetails}>
                        View Details
                    </button>

                    <div className="dashboard-card-actions">
                        {sprint.status !== 'completed' && (
                            <button
                                type="button"
                                className="btn-finish-sprint"
                                onClick={e => {
                                    e.stopPropagation();
                                    setShowFinishModal(true);
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
                                            : "Finish Sprint"
                                }
                            >
                                Finish Sprint
                            </button>
                        )}
                         <button type="button" className="btn-view-board" onClick={handleViewBoardClick}>
                            View Board
                        </button>
                    </div>
                </div>

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
                                    onClick={e => {
                                        e.stopPropagation();
                                        setShowFinishModal(false);
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
            <div className={`details-expander ${isDetailsVisible ? 'visible' : ''}`}>
                <SprintDetails sprint={sprint} />
            </div>
        </div>
    );
}

const StartupDashboardPage = () => {
    const [showNoBoardModal, setShowNoBoardModal] = useState(false);
    const { data, isLoading, error } = useGetMySprintsQuery();

    const sprintData = data?.data?.sprints || [];

    return (
        <div className="dashboard-page">
            <div className="dashboard-top-section">
                <h1 className="dashboard-hero-title">Track Your Sprint</h1>
            </div>

            <div className="dashboard-cards-container">
                {isLoading && <div>Loading sprints...</div>}
                {error && <div style={{ color: 'red' }}>Failed to load sprints.</div>}
                {!isLoading && sprintData.length === 0 && (
                    <div>No active sprints found.</div>
                )}
                {sprintData.map((sprint) => (
                    <SprintCard
                        key={sprint.id}
                        sprint={sprint}
                        onNoBoardClick={() => setShowNoBoardModal(true)}
                    />
                ))}
            </div>

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
    );
}

export default StartupDashboardPage;
