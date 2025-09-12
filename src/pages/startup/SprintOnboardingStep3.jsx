import React from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function SprintOnboardingStep3() {
  const { questionnaireId } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 32, background: "#fff", borderRadius: 16 }}>
      <h2>Step 3: Upload Documents</h2>
      <p>
        Please upload any required documents to complete your onboarding.
      </p>
      {/* Document upload UI would go here */}
      <button
        style={{
          background: "#EB5E28",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          padding: "12px 32px",
          fontSize: "1rem",
          fontWeight: 500,
          marginTop: 24,
          cursor: "pointer"
        }}
        onClick={() => navigate(`/startup/dashboard`)}
      >
        Finish Onboarding
      </button>
    </div>
  );
}
