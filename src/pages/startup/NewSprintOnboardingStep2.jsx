import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUploadDocumentsMutation, useGetSprintByIdQuery } from "../../store/api/sprintsApi";
import leanSprintLogo from "../../assets/logo/LeanSprintNewLogo.png";
import "./NewSprintOnboardingStep2.css";

export default function NewSprintOnboardingStep2() {
  const { questionnaireId, sprintId } = useParams();
  const navigate = useNavigate();
  const [contactLists, setContactLists] = React.useState("");
  const [appDemo, setAppDemo] = React.useState("");
  const [file, setFile] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [uploadDocuments] = useUploadDocumentsMutation();

  const { data: sprintData, isLoading: sprintLoading, error: sprintError } = useGetSprintByIdQuery(sprintId, { skip: !sprintId });
  const sprint = sprintData?.data?.sprint || null;

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  const handleBack = () => {
    navigate("/startup/dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sprint) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("contactLists", contactLists);
      formData.append("appDemo", appDemo);
      if (file) formData.append("brandGuidelines", file);

      await uploadDocuments({ id: sprint.id, formData }).unwrap();
      navigate(`/new-sprint/onboarding/${questionnaireId}/step3/${sprint.id}`);
    } catch (err) {
      alert("Failed to upload documents");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ns-step2-page">
      {/* Mobile Header */}
      <div className="ns-step2-mobile-header">
        <img src={leanSprintLogo} alt="LeanSprint" className="ns-step2-mobile-logo" />
        <button className="ns-step2-mobile-back-btn" onClick={handleBack}>
          Back
        </button>
      </div>

      {/* Desktop Header */}
      <div className="ns-step2-desktop-header">
        <img src={leanSprintLogo} alt="LeanSprint" className="ns-step2-desktop-logo" />
        <button className="ns-step2-desktop-back-btn" onClick={handleBack}>
          Back
        </button>
      </div>

      <div className="ns-step2-container">
        <div className="ns-step2-form-title">Step 2: Upload Documents</div>
        <div className="ns-step2-form-subtitle">
          Please upload any required documents and provide additional info to proceed.
        </div>
        {sprintLoading ? (
          <div>Loading sprint...</div>
        ) : !sprint ? (
          <div>
            <p>No sprint found for this questionnaire.</p>
            <a href="/startup/dashboard" style={{ color: "#EB5E28", textDecoration: "underline" }}>
              Go back to Dashboard
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="ns-step2-form">
            <label className="ns-step2-label">
              Contact Lists (optional):
              <input
                type="text"
                value={contactLists}
                onChange={e => setContactLists(e.target.value)}
                className="ns-step2-input"
                placeholder="Enter contact lists info"
              />
            </label>
            <label className="ns-step2-label">
              App Demo (optional):
              <input
                type="text"
                value={appDemo}
                onChange={e => setAppDemo(e.target.value)}
                className="ns-step2-input"
                placeholder="Enter app demo info"
              />
            </label>
            <label className="ns-step2-label">
              Brand Guidelines (PDF/DOC/DOCX, optional):
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="ns-step2-input"
              />
            </label>
            <button
              type="submit"
              className="ns-step2-tier-select-btn"
              disabled={submitting}
            >
              {submitting ? "Uploading..." : "Next: Payment"}
            </button>
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="ns-step2-form-footer">
        <span className="ns-step2-form-footer-left">© Leansprintr 2025. All Rights Reserved</span>
        <span className="ns-step2-form-footer-right">Terms of Services</span>
      </div>
    </div>
  );
}
