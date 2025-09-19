import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSetOnboardingStepMutation } from "../../store/api/authApi";
import { useGetSprintsByQuestionnaireQuery } from "../../store/api/sprintsApi";
import leanSprintLogo from "../../assets/logo/LeanSprintNewLogo.png";
import "./NewSprintOnboardingStep1.css";

export default function NewSprintOnboardingStep1() {
  const { questionnaireId } = useParams();
  const navigate = useNavigate();
  const [setOnboardingStep, { isLoading: settingStep }] = useSetOnboardingStepMutation();
  const { data: sprintsApiData, isLoading: sprintsLoading, error: sprintsError } =
    useGetSprintsByQuestionnaireQuery(questionnaireId, { skip: !questionnaireId });
  // Filter out draft sprints
  const sprints = (sprintsApiData?.data?.sprints || []).filter(sprint => sprint.status !== "draft");

  const handleNext = (sprintId) => {
    navigate(`/new-sprint/onboarding/${questionnaireId}/step2/${sprintId}`);
  };

  const handleBack = () => {
    navigate("/startup/dashboard");
  };

  return (
    <div className="ns-step1-page">
      {/* Mobile Header */}
      <div className="ns-step1-mobile-header">
        <img src={leanSprintLogo} alt="LeanSprint" className="ns-step1-mobile-logo" />
        <button className="ns-step1-mobile-back-btn" onClick={handleBack}>
          Back
        </button>
      </div>

      {/* Desktop Header */}
      <div className="ns-step1-desktop-header">
        <img src={leanSprintLogo} alt="LeanSprint" className="ns-step1-desktop-logo" />
        <button className="ns-step1-desktop-back-btn" onClick={handleBack}>
          Back
        </button>
      </div>

      <div className="ns-step1-container">
        <div className="ns-step1-form-title">Step 1: Select your sprint</div>
        <div className="ns-step1-form-subtitle">
          Choose from the available sprint options below.
        </div>
        
        {sprintsLoading ? (
          <div className="ns-step1-loading">Loading sprints...</div>
        ) : sprints.length === 0 ? (
          <div className="ns-step1-no-sprints">
            <p>No sprint found for this questionnaire.</p>
            <a href="/startup/dashboard" className="ns-step1-back-link">
              Go back to Dashboard
            </a>
          </div>
        ) : (
          <div className="ns-step1-sprint-options">
            {sprints.map((sprint, idx) => (
              <div key={sprint.id} className="ns-step1-sprint-option">
                <div className="ns-step1-sprint-info">
                  <div className="ns-step1-sprint-number">Sprint {idx + 1}</div>
                  <div className="ns-step1-sprint-title">{sprint.name}</div>
                  <div className="ns-step1-sprint-timeframe">Estimated Time: {sprint.estimatedDuration || "N/A"} weeks</div>
                  <div className="ns-step1-sprint-objective">Sprint Objective: {sprint.packageOptions?.[0]?.description || "No objective available"}</div>
                  <div className="ns-step1-sprint-deliverables">
                    <strong>Deliverables:</strong>
                    {Array.isArray(sprint.deliverables) ? (
                      <ul>
                        {sprint.deliverables.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    ) : (
                      <span>{sprint.deliverables || "No deliverables specified"}</span>
                    )}
                  </div>
                  <div className="ns-step1-sprint-hours">Estimated Total Hours for Sprint {idx + 1}: {sprint.estimatedDuration ? sprint.estimatedDuration * 30 : "N/A"} working hours</div>
                </div>
                <div className="ns-step1-sprint-action">
                  <button
                    className="ns-step1-sprint-get-started-btn"
                    onClick={() => handleNext(sprint.id)}
                    disabled={settingStep}
                  >
                    Next
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>      {/* Footer */}
      <div className="ns-step1-form-footer">
        <span className="ns-step1-form-footer-left">© Leansprintr 2025. All Rights Reserved</span>
        <span className="ns-step1-form-footer-right">Terms of Services</span>
      </div>
    </div>
  );
}
