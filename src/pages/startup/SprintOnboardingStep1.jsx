import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Input, TextArea } from "../../components/ui";
import { useUploadDocumentsMutation } from "../../store/api/sprintsApi";
import longImage from "../../assets/images/long.png";
import leanSprintLogo from "../../assets/logo/LeanSprintNewLogo.png";
import "./SprintOnboardingStep1.css";

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

const SprintOnboardingStep1 = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { sprintId } = useParams();

  const [formData, setFormData] = useState({
    brandGuidelines: null,
    contactLists: "",
    appDemo: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadDocuments] = useUploadDocumentsMutation();

  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing/selecting
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          brandGuidelines: "Please upload a PDF or Word document",
        }));
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          brandGuidelines: "File size must be less than 10MB",
        }));
        return;
      }

      updateFormData("brandGuidelines", file);
    }
  };

  const validateForm = () => {
    // All fields are now optional - no validation required
    // Users can proceed to step 2 with empty fields
    return true;
  };

  const handleNext = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();

      // Add file if selected
      if (formData.brandGuidelines) {
        formDataToSend.append("brandGuidelines", formData.brandGuidelines);
      }

      // Add text fields
      formDataToSend.append("contactLists", formData.contactLists);
      formDataToSend.append("appDemo", formData.appDemo);

      // Use RTK Query mutation for upload
      const result = await uploadDocuments({
        id: sprintId,
        body: formDataToSend,
      }).unwrap();

      console.log("Upload successful:", result);

      // Navigate to next step with sprint ID
      navigate(`/sprint/${sprintId}/onboarding/step-2`);
    } catch (error) {
      console.error("Error saving data:", error);
      setErrors({
        submit: error.message || "Failed to save data. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("/sprint/status");
  };

  // Simple check for sprintId
  if (!sprintId) {
    return (
      <div className="sprint-onboarding-page">
        {isMobile ? (
          <>
            <div className="sprint-onboarding-mobile-header">
              <img src={leanSprintLogo} alt="LeanSprint" className="sprint-onboarding-mobile-logo" />
              <button className="sprint-onboarding-mobile-back-btn" onClick={() => navigate("/")}>
                Back to home
              </button>
            </div>
            <div className="sprint-onboarding-mobile-container">
              <div className="sprint-onboarding-mobile-title">Error</div>
              <p>Sprint ID not found. Please go back to sprint selection.</p>
              <button
                onClick={() => navigate("/sprint/status")}
                className="sprint-get-started-btn"
              >
                Back to Sprint Selection
              </button>

              {/* Mobile Footer */}
              <div className="sprint-onboarding-form-footer">
                <div className="sprint-onboarding-form-footer-right">
                  <a href="https://docs.google.com/document/d/1lJUfsQIu6KmIx6mPEQz98gUYaQxmWZMopOQ4mw87v6M/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="sprint-onboarding-terms-link">
                    Terms of Services
                  </a>
                </div>
                <div className="sprint-onboarding-form-footer-left">
                  © Leansprintr by Taotter. All Rights Reserved.
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="sprint-onboarding-split-container">
            <div className="sprint-onboarding-left">
              <div className="sprint-onboarding-form-title">
                Start Your Sprint
              </div>
              <div className="sprint-onboarding-form-subtitle">
                Sprint ID not found
              </div>
              <p>Please go back to sprint selection.</p>
              <button
                onClick={() => navigate("/sprint/status")}
                className="sprint-get-started-btn"
              >
                Back to Sprint Selection
              </button>
            </div>
            <div className="sprint-onboarding-right">
              <img
                src={longImage}
                alt="Sprint Onboarding"
                className="sprint-onboarding-image"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="sprint-onboarding-page">
      {isMobile ? (
        <>
          <div className="sprint-onboarding-mobile-header">
            <img src={leanSprintLogo} alt="LeanSprint" className="sprint-onboarding-mobile-logo" />
            <button className="sprint-onboarding-mobile-back-btn" onClick={() => navigate("/")}>
              Back to home
            </button>
          </div>

          <div className="sprint-onboarding-mobile-container">
            <div className="sprint-onboarding-mobile-title">
              Your Startup Material
            </div>
            <div className="sprint-onboarding-mobile-subtitle">
              To begin efficiently, we kindly request access to the following
              (all fields are optional)
            </div>

            <form className="sprint-onboarding-form">
              {/* Brand Guidelines Upload */}
              <div className="sprint-onboarding-form-field">
                <label className="field-label">
                  Brand Guidelines (Optional)
                </label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    id="brandGuidelines"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="file-input"
                  />
                  <label
                    htmlFor="brandGuidelines"
                    className="file-upload-button"
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        width: "100%",
                      }}
                    >
                      <span style={{ flex: 1 }}>Upload Doc or File</span>
                    </span>
                  </label>
                  {formData.brandGuidelines && (
                    <div className="file-selected">
                      Selected: {formData.brandGuidelines.name}
                    </div>
                  )}
                </div>
                {errors.brandGuidelines && (
                  <div className="error-message">{errors.brandGuidelines}</div>
                )}
              </div>

              {/* Contact Lists */}
              <div className="sprint-onboarding-form-field">
                <label className="field-label">
                  Key contacts, databases or useful resources (optional)
                </label>
                <TextArea
                  value={formData.contactLists}
                  onChange={(e) =>
                    updateFormData("contactLists", e.target.value)
                  }
                  placeholder="Enter details or info"
                  rows={4}
                  error={errors.contactLists}
                  variant="outlined"
                />
              </div>

              {/* App/Demo Access */}
              <div className="sprint-onboarding-form-field">
                <label className="field-label">
                  Access to the app, demo or prototype (if available)
                </label>
                <Input
                  type="url"
                  value={formData.appDemo}
                  onChange={(e) => updateFormData("appDemo", e.target.value)}
                  placeholder="Share Link"
                  error={errors.appDemo}
                  variant="outlined"
                />
              </div>
            </form>

            {/* Submit Error */}
            {errors.submit && (
              <div className="submit-error">{errors.submit}</div>
            )}

            {/* Navigation Buttons */}
            <div className="sprint-onboarding-navigation">
              <Button
                variant="secondary"
                onClick={handleBack}
                className="nav-button back-button"
              >
                Back
              </Button>

              <Button
                variant="primary"
                onClick={handleNext}
                disabled={isSubmitting}
                className="nav-button next-button"
              >
                {isSubmitting ? "Saving..." : "Next"}
              </Button>
            </div>

            {/* Mobile Footer */}
            <div className="sprint-onboarding-form-footer">
              <div className="sprint-onboarding-form-footer-right">
                <a href="https://docs.google.com/document/d/1lJUfsQIu6KmIx6mPEQz98gUYaQxmWZMopOQ4mw87v6M/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="sprint-onboarding-terms-link">
                  Terms of Services
                </a>
              </div>
              <div className="sprint-onboarding-form-footer-left">
                © Leansprintr by Taotter. All Rights Reserved.
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="sprint-onboarding-split-container">
          <div className="sprint-onboarding-left">
            <div className="sprint-onboarding-desktop-header">
              <img
                src={leanSprintLogo}
                alt="LeanSprint"
                className="sprint-onboarding-desktop-logo"
              />
              <button
                onClick={() => navigate("/")}
                className="sprint-onboarding-desktop-back-btn"
              >
                Back to home
              </button>
            </div>
            <div className="sprint-onboarding-content">
              <div className="sprint-onboarding-title">
                Your Startup Material
              </div>
              <div className="sprint-onboarding-subtitle">
                To begin efficiently, we kindly request access to the following
                (all fields are optional)
              </div>

              <form className="sprint-onboarding-form">
                {/* Brand Guidelines Upload */}
                <div className="sprint-onboarding-form-field">
                  <label className="field-label">
                    Brand Guidelines (Optional)
                  </label>
                  <div className="file-upload-container">
                    <input
                      type="file"
                      id="brandGuidelines"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="file-input"
                    />
                    <label
                      htmlFor="brandGuidelines"
                      className="file-upload-button"
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          width: "100%",
                        }}
                      >
                        <span style={{ flex: 1 }}>Upload Doc or File</span>
                      </span>
                    </label>
                    {formData.brandGuidelines && (
                      <div className="file-selected">
                        Selected: {formData.brandGuidelines.name}
                      </div>
                    )}
                  </div>
                  {errors.brandGuidelines && (
                    <div className="error-message">
                      {errors.brandGuidelines}
                    </div>
                  )}
                </div>

                {/* Contact Lists */}
                <div className="sprint-onboarding-form-field">
                  <label className="field-label">
                    Key contacts, databases or useful resources (optional)
                  </label>
                  <TextArea
                    value={formData.contactLists}
                    onChange={(e) =>
                      updateFormData("contactLists", e.target.value)
                    }
                    placeholder="Enter details or info"
                    rows={4}
                    error={errors.contactLists}
                    variant="outlined"
                  />
                </div>

                {/* App/Demo Access */}
                <div className="sprint-onboarding-form-field">
                  <label className="field-label">
                    Access to the app, demo or prototype (if available)
                  </label>
                  <Input
                    type="url"
                    value={formData.appDemo}
                    onChange={(e) => updateFormData("appDemo", e.target.value)}
                    placeholder="Share Link"
                    error={errors.appDemo}
                    variant="outlined"
                  />
                </div>
              </form>

              {/* Submit Error */}
              {errors.submit && (
                <div className="submit-error">{errors.submit}</div>
              )}

              {/* Navigation Buttons */}
              <div className="sprint-onboarding-btn-row">
                <Button
                  variant="secondary"
                  onClick={handleBack}
                  className="sprint-onboarding-btn-back"
                >
                  Back
                </Button>

                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="sprint-onboarding-btn-next"
                >
                  {isSubmitting ? "Saving..." : "Next"}
                </Button>
              </div>

              {/* Footer */}
              <div className="sprint-onboarding-footer">
                <div className="sprint-onboarding-footer-left">
                  © Leansprintr by Taotter. All Rights Reserved.
                </div>
                <div className="sprint-onboarding-footer-right">
                <a href="https://docs.google.com/document/d/1lJUfsQIu6KmIx6mPEQz98gUYaQxmWZMopOQ4mw87v6M/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="sprint-onboarding-terms-link">
                  Terms of Services
                </a>
                </div>
              </div>
            </div>
          </div>
          <div className="sprint-onboarding-right">
            <img
              src={longImage}
              alt="Sprint Onboarding"
              className="sprint-onboarding-image"
            />
            <div className="sprint-onboarding-image-overlay">
              <h2>From Idea to Customers</h2>
              <p>
                Validate your idea and get your first customers with guided
                execution sprints.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintOnboardingStep1;
