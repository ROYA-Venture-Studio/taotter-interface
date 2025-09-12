import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSetOnboardingStepMutation } from "../../store/api/authApi";
import { useGetSprintsByQuestionnaireQuery } from "../../store/api/sprintsApi";
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

  return (
    <div className="ns-step1-split-container">
      <div className="ns-step1-left">
        <div className="ns-step1-form-title">Step 1: Select your sprint</div>
        <div className="ns-step1-form-subtitle">
          Choose from the available sprint options below.
        </div>
        {sprintsLoading ? (
          <div>Loading sprints...</div>
        ) : sprints.length === 0 ? (
          <div>
            <p>No sprint found for this questionnaire.</p>
            <a href="/startup/dashboard" style={{ color: "#EB5E28", textDecoration: "underline" }}>
              Go back to Dashboard
            </a>
          </div>
        ) : (
          <div className="ns-step1-sprint-options">
            {sprints.map((sprint, idx) => (
              <div key={sprint.id} className="ns-step1-sprint-option">
                <div className="ns-step1-sprint-info">
                  <div className="ns-step1-sprint-number">⚙ Sprint {idx + 1}</div>
                  <div className="ns-step1-sprint-title">{sprint.name}</div>
                  <div className="ns-step1-sprint-timeframe">Estimated Time: {sprint.estimatedDuration || "N/A"} weeks</div>
                  <div className="ns-step1-sprint-objective">Sprint Objective: {sprint.packageOptions?.[0]?.description || "No objective available"}</div>
                  <div className="ns-step1-sprint-deliverables">
                    <strong>Deliverables:</strong>
                    <br />
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
                  <div className="ns-step1-sprint-hours">⚠ Estimated Total Hours for Sprint {idx + 1}: {sprint.estimatedDuration ? sprint.estimatedDuration * 30 : "N/A"} working hours</div>
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
      </div>
    </div>
  );
}
