import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';
import { useGetMySprintsQuery, useGetProposalsByQuestionnaireQuery } from '../../store/api/sprintsApi';
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
    // Onboarding branch: show only onboarding actions for temp sprints
    const isOnboarding = sprint.status === 'draft';
    const isPaymentPending = sprint.selectedPackage && sprint.selectedPackagePaymentStatus !== "paid";
    const [showPaymentModal, setShowPaymentModal] = React.useState(false);

    if (isOnboarding) {
        const navigate = useNavigate();
        // RTK Query for proposals
        const questionnaireId = String(sprint.questionnaireId || '').trim();
        const isValidQuestionnaireId = questionnaireId && /^[0-9a-fA-F]{24}$/.test(questionnaireId);
        const { data: proposalsData, isLoading: proposalsLoading, error: proposalsError } =
          useGetProposalsByQuestionnaireQuery(questionnaireId, { skip: !isValidQuestionnaireId });

        const hasProposals = Array.isArray(proposalsData?.data?.proposals) && proposalsData.data.proposals.length > 0;
        const checking = proposalsLoading;
        const handleProceedOnboarding = (e) => {
            e.stopPropagation();
if (hasProposals && sprint.questionnaireId) {
                navigate(`/new-sprint/onboarding/${sprint.questionnaireId}/step1`);
            }
        };
        const handleScheduleMeeting = (e) => {
            e.stopPropagation();
            alert('Schedule meeting flow not implemented yet.');
        };
        return (
            <div className="dashboard-card-wrapper">
                <div className="dashboard-card onboarding-card">
                    <div className="dashboard-card-header">
                        <span className="dashboard-card-subtitle">Sprint Onboarding</span>
                    </div>
                    <div style={{ margin: "0 0", color: "#222", fontSize: "16px", fontWeight: 500 }}>
                        We have received your request and it is currently under review.
                    </div>
                    <div className="dashboard-card-footer">
                        <button
                            type="button"
                            className="btn-onboarding"
                            style={{ background: "#EB5E28", color: "#fff", borderRadius: 6, padding: "8px 24px", fontWeight: 500, marginRight: 12 }}
                            onClick={handleProceedOnboarding}
                            disabled={checking || !hasProposals}
                        >
                            {checking
                                ? "Checking for proposals..."
                                : hasProposals
                                    ? "Proceed with Onboarding"
                                    : "Waiting for admin proposals"}
                        </button>
                        <button
                            type="button"
                            className="btn-onboarding"
                            style={{ background: "#22c55e", color: "#fff", borderRadius: 6, padding: "8px 24px", fontWeight: 500 }}
                            onClick={handleScheduleMeeting}
                        >
                            Schedule Meeting
                        </button>
                    </div>

                </div>
            </div>
        );
    }

    // Payment pending: show normal card, but disable actions and show modal on click
    if (isPaymentPending) {
        const handleCardClick = (e) => {
            e.stopPropagation();
            setShowPaymentModal(true);
        };
        const handleCloseModal = () => setShowPaymentModal(false);

        // Render normal card, but disable actionable buttons
        return (
            <div className="dashboard-card-wrapper">
                <div
                    className="dashboard-card"
                    onClick={handleCardClick}
                    tabIndex={0}
                    role="button"
                    style={{ outline: 'none', opacity: 0.7, cursor: "not-allowed" }}
                    onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            handleCardClick(e);
                        }
                    }}
                >
                    <div className="dashboard-card-header">
                        <span className="dashboard-card-subtitle">{sprint.type ? sprint.type.charAt(0).toUpperCase() + sprint.type.slice(1) : 'Sprint'}</span>
                        <div className="dashboard-card-status-row">
                            <h3 className="dashboard-card-title">{sprint.name}</h3>
                            <span className={`dashboard-status-pill cancelled`}>
                                Payment Pending
                            </span>
                        </div>
                    </div>
                    <div className="dashboard-progress-row">
                        <div className="dashboard-progress-bar-outer">
                            <div
                                className={`dashboard-progress-bar-inner cancelled`}
                                style={{ width: `0%` }}
                            />
                        </div>
                        <span className="dashboard-progress-percent">
                            0%
                        </span>
                    </div>
                    <div className="dashboard-card-footer">
                        <button type="button" className="details-btn" disabled>
                            View Details
                        </button>
                        <div className="dashboard-card-actions">
                            <button type="button" className="btn-finish-sprint" disabled>
                                Finish Sprint
                            </button>
                            <button type="button" className="btn-view-board" disabled>
                                View Board
                            </button>
                        </div>
                    </div>
                </div>
                {showPaymentModal && (
                    <div className="dashboard-modal-backdrop">
                        <div className="dashboard-modal">
                            <h2>Payment Pending</h2>
                            <p className="dashboard-modal-subtitle">
                                Your payment is being verified by the admin.<br />
                                Once confirmed, your sprint will be unlocked.
                            </p>
                            <div className="dashboard-modal-actions">
                                <Button
                                    type="button"
                                    variant="primary"
                                    className="dashboard-modal-btn"
                                    onClick={handleCloseModal}
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
    const { data, isLoading, error } = useGetStartupBoardBySprintQuery(sprint.id, { skip: !sprint.id });
    const [showFinishModal, setShowFinishModal] = useState(false);
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);
    const [finishSprint, { isLoading: isFinishing }] = useFinishSprintMutation();
    const [localStatus, setLocalStatus] = useState(sprint.status);
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

    // Sprint onboarding state transitions
    const handleBookCall = (e) => {
        e.stopPropagation();
        // Simulate Calendly integration and move to next state
        setLocalStatus('select-package');
    };

    const handleNextStep = (e) => {
        e.stopPropagation();
        // Navigate to onboarding step 1, passing questionnaireId
if (sprint.questionnaireId) {
            navigate(`/new-sprint/onboarding/${sprint.questionnaireId}/step1`);
        }
        setLocalStatus('onboarding-step1');
    };

    const handlePackageSelection = (e) => {
        e.stopPropagation();
        // Navigate to onboarding step 2, passing questionnaireId
if (sprint.questionnaireId) {
            navigate(`/new-sprint/onboarding/${sprint.questionnaireId}/step2`);
        }
        setLocalStatus('payment-pending');
    };

    const handlePaymentComplete = (e) => {
        e.stopPropagation();
        setLocalStatus('active');
    };

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

    // Render onboarding buttons based on sprint status
    let onboardingButton = null;
    if (localStatus === 'book-call') {
        onboardingButton = (
            <button
                type="button"
                className="btn-onboarding"
                style={{ background: "#EB5E28", color: "#fff", borderRadius: 6, padding: "8px 24px", fontWeight: 500 }}
                onClick={handleBookCall}
            >
                Book a Call
            </button>
        );
    } else if (localStatus === 'select-package') {
        onboardingButton = (
            <button
                type="button"
                className="btn-onboarding"
                style={{ background: "#EB5E28", color: "#fff", borderRadius: 6, padding: "8px 24px", fontWeight: 500 }}
                onClick={handleNextStep}
            >
                Next
            </button>
        );
    } else if (localStatus === 'onboarding-step1') {
        onboardingButton = (
            <button
                type="button"
                className="btn-onboarding"
                style={{ background: "#EB5E28", color: "#fff", borderRadius: 6, padding: "8px 24px", fontWeight: 500 }}
                onClick={handlePackageSelection}
            >
                Select Package
            </button>
        );
    } else if (localStatus === 'payment-pending') {
        onboardingButton = (
            <button
                type="button"
                className="btn-onboarding"
                style={{ background: "#aaa", color: "#fff", borderRadius: 6, padding: "8px 24px", fontWeight: 500 }}
                disabled
            >
                Payment Pending
            </button>
        );
    } else if (localStatus === 'active') {
        onboardingButton = (
            <button
                type="button"
                className="btn-onboarding"
                style={{ background: "#22c55e", color: "#fff", borderRadius: 6, padding: "8px 24px", fontWeight: 500 }}
                disabled
            >
                Active Sprint
            </button>
        );
    }

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
                        <span className={`dashboard-status-pill ${statusColors[localStatus] || 'ongoing'}`}>
                            {getStatusLabel(localStatus)}
                        </span>
                    </div>
                </div>
                <div className="dashboard-progress-row">
                    <div className="dashboard-progress-bar-outer">
                        <div
                            className={`dashboard-progress-bar-inner ${statusColors[localStatus] || 'ongoing'}`}
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
                        {localStatus !== 'completed' && (
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
                        {onboardingButton}
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
                                    className="dashboard-modal-btn secondary"
                                    onClick={e => {
                                        e.stopPropagation();
                                        setShowFinishModal(false);
                                    }}
                                >
                                    Close
                                </Button>
                                <Button
                                    type="button"
                                    className="dashboard-modal-btn primary"
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
    const { data, isLoading, error, refetch } = useGetMySprintsQuery();

    // Local sprints state for optimistic updates
    const localSprints = React.useMemo(() => {
        // Show all sprints except inactive
        return (data?.data?.sprints || []).filter(sprint => sprint.status !== "inactive");
    }, [data]);

    // Filter completed sprints
    const completedSprints = localSprints.filter(sprint => sprint.status === 'completed');

    // Modal state for Start New Sprint workflow
    const [showStartSprintModal, setShowStartSprintModal] = useState(false);

    // Handler to add new sprint card after questionnaire submission
    const handleAddSprint = (sprint) => {
        // Save draft sprint ID to localStorage for later deletion
        if (sprint && sprint.status === "draft" && sprint.id) {
            localStorage.setItem("draftSprintId", sprint.id);
        }
        refetch();
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-top-section">
                <h1 className="dashboard-hero-title">Track Your Sprint</h1>
            </div>

            <div className="dashboard-cards-container">
                {isLoading && <div>Loading sprints...</div>}
                {error && <div style={{ color: 'red' }}>Failed to load sprints.</div>}
                {!isLoading && localSprints.length === 0 && (
                    <div>No active sprints found.</div>
                )}
                {localSprints.map((sprint) => (
                    <SprintCard
                        key={sprint.id}
                        sprint={sprint}
                        onNoBoardClick={() => setShowNoBoardModal(true)}
                    />
                ))}
            </div>
            {/* Start New Sprint Button */}
            {completedSprints.length > 0 && (
                <button
                    className="start-new-sprint-btn"
                    style={{
                        width: '150px',
                        height: '44px',
                        backgroundColor: '#EB5E28',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '500',
                        marginTop: '32px',
                        display: 'block',
                        marginLeft: 'auto',
                        marginRight: 'auto'
                    }}
                    onClick={() => setShowStartSprintModal(true)}
                >
                    Start New Sprint
                </button>
            )}

            {/* Start New Sprint Modal */}
            {showStartSprintModal && (
                <StartSprintModal
                    onClose={() => setShowStartSprintModal(false)}
                    onSprintCreated={handleAddSprint}
                />
            )}

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

import { useCreateQuestionnaireMutation, useLinkQuestionnaireMutation } from '../../store/api/questionnairesApi';

import { useCreateTempSprintMutation } from '../../store/api/sprintsApi';

function StartSprintModal({ onClose, onSprintCreated }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        startupName: '',
        taskName: '',
        taskDescription: '',
        stage: '',
        keyGoals: '',
        timeCommitment: 'full-time',
        timeline: '',
        budgetRange: '',
        customRequest: ''
    });

    // Options
    const stageOptions = [
        { value: '', label: 'Select Stage' },
        { value: 'idea', label: 'Idea' },
        { value: 'validation', label: 'Validation' },
        { value: 'growth', label: 'Growth' }
    ];
    const timelineOptions = [
        { value: '', label: 'Select Timeline' },
        { value: '1-2 weeks', label: '1-2 weeks' },
        { value: '3-4 weeks', label: '3-4 weeks' },
        { value: '1-2 months', label: '1-2 months' },
        { value: '3-6 months', label: '3-6 months' },
        { value: '6+ months', label: '6+ months' }
    ];

    // Field update
    const updateFormData = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    // Validation
    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.startupName.trim()) newErrors.startupName = 'Startup name is required';
        if (!formData.taskName.trim()) newErrors.taskName = 'Task name is required';
        if (!formData.taskDescription.trim()) {
            newErrors.taskDescription = 'Task description is required';
        } else if (formData.taskDescription.trim().length < 10) {
            newErrors.taskDescription = 'Task description must be at least 10 characters long';
        }
        if (!formData.stage) newErrors.stage = 'Please select a stage';
        if (!formData.keyGoals.trim()) {
            newErrors.keyGoals = 'Key goals are required';
        } else if (formData.keyGoals.trim().length < 10) {
            newErrors.keyGoals = 'Key goals must be at least 10 characters long';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const validateStep2 = () => {
        const newErrors = {};
        if (!formData.timeline.trim()) newErrors.timeline = 'Timeline is required';
        if (!formData.budgetRange.trim()) newErrors.budgetRange = 'Please enter a budget range';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const validateStep3 = () => {
        setErrors({});
        return true;
    };

    // Navigation
    const handleNext = () => {
        let isValid = false;
        if (currentStep === 1) isValid = validateStep1();
        else if (currentStep === 2) isValid = validateStep2();
        else if (currentStep === 3) isValid = validateStep3();
        if (isValid && currentStep < 3) setCurrentStep(currentStep + 1);
        else if (isValid && currentStep === 3) handleSubmit();
    };
    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    // API mutation
    const [createQuestionnaire] = useCreateQuestionnaireMutation();
    const [createTempSprint] = useCreateTempSprintMutation();
    const [linkQuestionnaire] = useLinkQuestionnaireMutation();

    // Form submission
    const handleSubmit = async () => {
        if (!validateStep3()) return;
        setIsSubmitting(true);
        try {
            // Map frontend fields to backend schema
            const questionnaireData = {
                basicInfo: {
                    startupName: formData.startupName,
                    taskType: formData.taskName,
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

            // Get startupId from localStorage user object
            let startupId = null;
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                console.log('User object from localStorage:', user);
                startupId = user && user.id ? user.id : null;
            } catch (e) {
                startupId = null;
            }
            if (startupId) {
                questionnaireData.startupId = startupId;
            }

            console.log('Questionnaire payload:', questionnaireData);
            const response = await createQuestionnaire(questionnaireData).unwrap();
            const createdQ = response?.data?.questionnaire || response?.data?.questionnaire;
            const questionnaireId = createdQ?.id || createdQ?._id;
            const temporaryId = createdQ?.temporaryId || createdQ?.temporaryId;

            // Helper to create temp sprint via RTK Query
            const createTempSprintRTK = async (qid) => {
                const sprintResponse = await createTempSprint({
                    questionnaireId: qid,
                    name: formData.startupName,
                    description: formData.taskDescription,
                    type: formData.stage ? (['idea', 'validation', 'growth'].includes(formData.stage) ? { idea: 'custom', validation: 'validation', growth: 'mvp' }[formData.stage] : 'custom') : 'custom',
                    estimatedDuration: 14
                }).unwrap();
                const sprint = sprintResponse.data.sprint;
                onSprintCreated(sprint);
            };

            if (temporaryId) {
                try {
                    const linkResponse = await linkQuestionnaire(temporaryId).unwrap();
                    const linkedId = linkResponse?.data?.questionnaire?.id || questionnaireId;
                    await createTempSprintRTK(linkedId);
                } catch (err) {
                    setErrors({ submit: 'Failed to start sprint. Please try again.' });
                }
            } else if (questionnaireId) {
                await createTempSprintRTK(questionnaireId);
            }
            setIsSubmitting(false);
            onClose();
        } catch (error) {
            setIsSubmitting(false);
            setErrors({ submit: 'Failed to start sprint. Please try again.' });
        }
    };

    return (
        <div className="dashboard-modal-backdrop">
            <div className="dashboard-modal" style={{ width: "100%", maxWidth: "600px", borderRadius: "16px", padding: "32px" }}>
                <h2>Start New Sprint</h2>
<div style={{ marginTop: 16, width: '100%', boxSizing: 'border-box' }}>
<div style={{ display: 'flex', gap: 8, marginBottom: 24, width: '100%', boxSizing: 'border-box' }}>
                        {[1, 2, 3].map(step => (
                            <div
                                key={step}
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    background: currentStep === step ? '#EB5E28' : '#eee',
                                    color: currentStep === step ? '#fff' : '#222',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: 16,
                                    border: currentStep > step ? '2px solid #EB5E28' : 'none'
                                }}
                            >
                                {step}
                            </div>
                        ))}
                    </div>
                    {/* Step 1 */}
                    {currentStep === 1 && (
                        <>
<div style={{ marginBottom: 20, width: '100%', boxSizing: 'border-box' }}>
                                <label style={{ color: "#222", textAlign: "left", display: "block" }}>Startup Name</label>
<input
                                    value={formData.startupName}
                                    onChange={e => updateFormData('startupName', e.target.value)}
                                    placeholder="Enter Name"
                                    style={{
                                        width: '100%',
                                        border: "1px solid #D0D5DD",
                                        borderRadius: "8px",
                                        minHeight: "44px",
                                        padding: "0 12px",
                                        fontSize: "16px",
                                        boxSizing: "border-box",
                                        color: "#222"
                                    }}
                                />
                                {errors.startupName && <div style={{ color: 'red', fontSize: 12 }}>{errors.startupName}</div>}
                            </div>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ color: "#222", textAlign: "left", display: "block" }}>Task Name</label>
<input
                                    value={formData.taskName}
                                    onChange={e => updateFormData('taskName', e.target.value)}
                                    placeholder="Enter Task Name"
                                    style={{
                                        width: '100%',
                                        border: "1px solid #D0D5DD",
                                        borderRadius: "8px",
                                        minHeight: "44px",
                                        padding: "0 12px",
                                        fontSize: "16px",
                                        boxSizing: "border-box",
                                        color: "#222"
                                    }}
                                />
                                {errors.taskName && <div style={{ color: 'red', fontSize: 12 }}>{errors.taskName}</div>}
                            </div>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ color: "#222", textAlign: "left", display: "block" }}>Task Description</label>
<input
                                    value={formData.taskDescription}
                                    onChange={e => updateFormData('taskDescription', e.target.value)}
                                    placeholder="Give us a brief of the task (minimum 10 characters)"
                                    style={{
                                        width: '100%',
                                        border: "1px solid #D0D5DD",
                                        borderRadius: "8px",
                                        minHeight: "44px",
                                        padding: "0 12px",
                                        fontSize: "16px",
                                        boxSizing: "border-box",
                                        color: "#222"
                                    }}
                                />
                                {errors.taskDescription && <div style={{ color: 'red', fontSize: 12 }}>{errors.taskDescription}</div>}
                            </div>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ color: "#222", textAlign: "left", display: "block" }}>Stage</label>
<select
                                    value={formData.stage}
                                    onChange={e => updateFormData('stage', e.target.value)}
                                    style={{
                                        width: '100%',
                                        border: "1px solid #D0D5DD",
                                        borderRadius: "8px",
                                        minHeight: "44px",
                                        padding: "0 12px",
                                        fontSize: "16px",
                                        boxSizing: "border-box",
                                        color: "#222"
                                    }}
                                >
                                    {stageOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                {errors.stage && <div style={{ color: 'red', fontSize: 12 }}>{errors.stage}</div>}
                            </div>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ color: "#222", textAlign: "left", display: "block" }}>Key Goals</label>
<textarea
                                    value={formData.keyGoals}
                                    onChange={e => updateFormData('keyGoals', e.target.value)}
                                    placeholder="e.g. Build MVP, Get First Users (minimum 10 characters)"
                                    rows={2}
                                    style={{
                                        width: '100%',
                                        border: "1px solid #D0D5DD",
                                        borderRadius: "8px",
                                        minHeight: "44px",
                                        padding: "8px 12px",
                                        fontSize: "16px",
                                        boxSizing: "border-box",
                                        color: "#222"
                                    }}
                                />
                                {errors.keyGoals && <div style={{ color: 'red', fontSize: 12 }}>{errors.keyGoals}</div>}
                            </div>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ color: "#222", textAlign: "left", display: "block" }}>Time Commitment</label>
<div style={{ display: 'flex', gap: 16, width: '100%', boxSizing: 'border-box', justifyContent: 'flex-start' }}>
<label style={{ color: "#222" }}>
                                        <input
                                            type="radio"
                                            name="timeCommitment"
                                            value="full-time"
                                            checked={formData.timeCommitment === 'full-time'}
                                            onChange={() => updateFormData('timeCommitment', 'full-time')}
                                        />
                                        Full-time
                                    </label>
<label style={{ color: "#222" }}>
                                        <input
                                            type="radio"
                                            name="timeCommitment"
                                            value="part-time"
                                            checked={formData.timeCommitment === 'part-time'}
                                            onChange={() => updateFormData('timeCommitment', 'part-time')}
                                        />
                                        Part-time
                                    </label>
                                </div>
                            </div>
                        </>
                    )}
                    {/* Step 2 */}
                    {currentStep === 2 && (
                        <>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ color: "#222", textAlign: "left", display: "block" }}>Timeline in Mind?</label>
<select
                                    value={formData.timeline}
                                    onChange={e => updateFormData('timeline', e.target.value)}
                                    style={{
                                        width: '100%',
                                        border: "1px solid #D0D5DD",
                                        borderRadius: "8px",
                                        minHeight: "44px",
                                        padding: "0 12px",
                                        fontSize: "16px",
                                        boxSizing: "border-box",
                                        color: "#222"
                                    }}
                                >
                                    {timelineOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                {errors.timeline && <div style={{ color: 'red', fontSize: 12 }}>{errors.timeline}</div>}
                            </div>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ color: "#222", textAlign: "left", display: "block" }}>Budget Range</label>
<input
                                    value={formData.budgetRange}
                                    onChange={e => updateFormData('budgetRange', e.target.value)}
                                    placeholder="Enter an estimated budget (in QAR)"
                                    style={{
                                        width: '100%',
                                        border: "1px solid #D0D5DD",
                                        borderRadius: "8px",
                                        minHeight: "44px",
                                        padding: "0 12px",
                                        fontSize: "16px",
                                        boxSizing: "border-box",
                                        color: "#222"
                                    }}
                                />
                                {errors.budgetRange && <div style={{ color: 'red', fontSize: 12 }}>{errors.budgetRange}</div>}
                            </div>
                        </>
                    )}
                    {/* Step 3 */}
                    {currentStep === 3 && (
                        <>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ color: "#222", textAlign: "left", display: "block" }}>Additional Information</label>
<input
                                    value={formData.customRequest}
                                    onChange={e => updateFormData('customRequest', e.target.value)}
                                    placeholder="Enter any additional information or requirements here."
                                    style={{
                                        width: '100%',
                                        border: "1px solid #D0D5DD",
                                        borderRadius: "8px",
                                        minHeight: "44px",
                                        padding: "0 12px",
                                        fontSize: "16px",
                                        boxSizing: "border-box",
                                        color: "#222"
                                    }}
                                />
                            </div>
                        </>
                    )}
<div style={{ marginTop: 24, display: 'flex', gap: 16, width: '100%', boxSizing: 'border-box', justifyContent: 'space-between' }}>
                        {currentStep > 1 && (
                            <button
                                type="button"
                                style={{
                                    background: "#fff",
                                    color: "#222",
                                    border: "1px solid #EB5E28",
                                    borderRadius: "6px",
                                    padding: "8px 24px",
                                    fontSize: "1rem",
                                    fontWeight: 500,
                                    cursor: "pointer"
                                }}
                                onClick={handleBack}
                            >
                                Back
                            </button>
                        )}
                        <button
                            type="button"
                            style={{
                                background: "#EB5E28",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                padding: "8px 24px",
                                fontSize: "1rem",
                                fontWeight: 500,
                                cursor: "pointer"
                            }}
                            onClick={handleNext}
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? (currentStep === 3 ? 'Starting Sprint...' : 'Loading...')
                                : (currentStep === 3 ? 'Start Sprint' : 'Next')}
                        </button>
                        <button
                            type="button"
                            style={{
                                background: "#fff",
                                color: "#222",
                                border: "1px solid #EB5E28",
                                borderRadius: "6px",
                                padding: "8px 24px",
                                fontSize: "1rem",
                                fontWeight: 500,
                                cursor: "pointer"
                            }}
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StartupDashboardPage;
