import React, { useState } from "react";
import "./ResponseModal.css";
import { useParams } from "react-router-dom";
import { useCreateSprintsForQuestionnaireMutation } from "../../../store/api/questionnairesApi";

const SPRINT_TYPES = [
  { value: "mvp", label: "MVP" },
  { value: "validation", label: "Validation" },
  { value: "branding", label: "Branding" },
  { value: "marketing", label: "Marketing" },
  { value: "fundraising", label: "Fundraising" },
  { value: "custom", label: "Custom" },
];

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const DEFAULT_CREDIT_TIERS = [
  {
    label: "Starter",
    key: "starter",
  },
  {
    label: "Growth",
    key: "growth",
  },
  {
    label: "Scale",
    key: "scale",
  },
];

function emptySprint() {
  return {
    name: "",
    label: "",
    type: "",
    estimatedDuration: "",
    priority: "medium",
    objective: "",
    deliverables: "",
    enabledTiers: {
      starter: false,
      growth: false,
      scale: false,
    },
    packageOptions: [
      { tier: "starter", hourlyRate: "", amount: "", qty: "", discount: "", paymentLink: "" },
      { tier: "growth", hourlyRate: "", amount: "", qty: "", discount: "", paymentLink: "" },
      { tier: "scale", hourlyRate: "", amount: "", qty: "", discount: "", paymentLink: "" },
    ],
  };
}

// Helper to create an empty error structure for a sprint
function emptySprintErrors() {
  return {
    name: "", label: "", type: "", estimatedDuration: "", objective: "", deliverables: "", tierError: "",
    packageOptions: [
      { hourlyRate: "", amount: "", qty: "" },
      { hourlyRate: "", amount: "", qty: "" },
      { hourlyRate: "", amount: "", qty: "" },
    ],
  };
}

export default function ResponseModal({ onClose }) {
  const { id: questionnaireId } = useParams();
  const [sprints, setSprints] = useState([emptySprint()]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const [createSprints, { isLoading }] = useCreateSprintsForQuestionnaireMutation();

  // Editable credit tiers state
  const [creditTiers, setCreditTiers] = useState(DEFAULT_CREDIT_TIERS);
  const [editingTierIdx, setEditingTierIdx] = useState(null);
  const [editingTierValue, setEditingTierValue] = useState("");

  // Handle input change for a sprint
  const handleSprintChange = (idx, field, value) => {
    setSprints((prev) =>
      prev.map((s, i) =>
        i === idx ? { ...s, [field]: value } : s
      )
    );
  };

  // Handle tier enable/disable
  const handleTierToggle = (sprintIdx, tierKey) => {
    setSprints((prev) =>
      prev.map((s, i) =>
        i === sprintIdx
          ? {
              ...s,
              enabledTiers: {
                ...s.enabledTiers,
                [tierKey]: !s.enabledTiers[tierKey],
              },
            }
          : s
      )
    );
  };

  // Handle package option change
  const handlePackageChange = (sprintIdx, tierIdx, field, value) => {
    setSprints((prev) =>
      prev.map((s, i) =>
        i === sprintIdx
          ? {
              ...s,
              packageOptions: s.packageOptions.map((p, j) =>
                j === tierIdx ? { ...p, [field]: value } : p
              ),
            }
          : s
      )
    );
  };

  // Add a new sprint section
  const handleAddSprint = () => {
    setSprints((prev) => [...prev, emptySprint()]);
  };

  // Validate all fields and return true if valid
  const validate = () => {
    const newErrors = [];
    let isValid = true;

    sprints.forEach((s) => {
      const sprintError = emptySprintErrors();
      
      // --- Sprint-level validation ---
      if (!s.name) { sprintError.name = "Project name is required."; isValid = false; }
      if (!s.label) { sprintError.label = "Sprint label is required."; isValid = false; }
      if (!s.type) { sprintError.type = "Sprint type is required."; isValid = false; }
      if (!s.estimatedDuration) { sprintError.estimatedDuration = "Estimated time is required."; isValid = false; }
      if (!s.objective) { sprintError.objective = "Sprint objective is required."; isValid = false; }
      if (!s.deliverables) { sprintError.deliverables = "Deliverables are required."; isValid = false; }

      // --- Tier-level validation ---
      const hasEnabledTier = Object.values(s.enabledTiers).some(enabled => enabled);
      if (!hasEnabledTier) {
        sprintError.tierError = "At least one credit tier must be enabled.";
        isValid = false;
      }

      creditTiers.forEach((tier, tierIdx) => {
        if (s.enabledTiers[tier.key]) {
          const p = s.packageOptions[tierIdx];
          const tierErrors = { hourlyRate: "", amount: "", qty: "" };
          if (!p.hourlyRate) { tierErrors.hourlyRate = "Required"; isValid = false; }
          if (!p.amount) { tierErrors.amount = "Required"; isValid = false; }
          if (!p.qty) { tierErrors.qty = "Required"; isValid = false; }
          sprintError.packageOptions[tierIdx] = tierErrors;
        }
      });
      
      newErrors.push(sprintError);
    });
    
    setValidationErrors(newErrors);
    return isValid;
  };

  // Prepare payload for API
  const preparePayload = () => {
    return sprints.map((s) => {
      // Split deliverables by line, trim, and filter out empty lines
      const deliverablesArr = s.deliverables
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      return {
        name: s.name,
        description: s.objective,
        type: s.type,
        estimatedDuration: parseInt(s.estimatedDuration, 10) || 1,
        priority: s.priority,
        deliverables: deliverablesArr,
        packageOptions: s.packageOptions
          .filter((p, idx) => s.enabledTiers[creditTiers[idx].key])
          .map((p, tierIndex) => {
            return {
              name: creditTiers[tierIndex].label,
              description: s.objective,
              price: parseFloat(p.amount) || 0,
              currency: "USD",
              engagementHours: parseInt(p.qty, 10) || 0,
              duration: parseInt(s.estimatedDuration, 10) || 1,
              features: [],
              teamSize: 1,
              isRecommended: creditTiers[tierIndex].key === "growth",
              hourlyRate: parseFloat(p.hourlyRate) || 0,
              discount: p.discount ? parseFloat(p.discount) : 0,
              tier: p.tier,
              paymentLink: p.paymentLink || "",
            };
          }),
      };
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setApiError("");
    
    if (!validate()) return;

    try {
      await createSprints({
        id: questionnaireId,
        sprints: preparePayload(),
      }).unwrap();
      setSuccess("Sprints created successfully!");
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1200);
    } catch (err) {
      setApiError(
        err?.data?.message ||
          "Failed to create sprints. Please try again."
      );
    }
  };

  return (
    <div className="response-modal-backdrop" onClick={onClose}>
      <div className="response-modal" onClick={(e) => e.stopPropagation()}>
        <button className="response-modal-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4.5 4.5L13.5 13.5M13.5 4.5L4.5 13.5" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        </button>
        <div className="response-modal-header">
          <h2 className="response-modal-title">Respond back to Enquiry</h2>
          <p className="response-modal-subtitle">
            The Founder is waiting for your response. Please fill in the details.
          </p>
        </div>
        <form className="response-modal-form" onSubmit={handleSubmit} noValidate>
          {sprints.map((s, idx) => (
            <div key={idx} className="response-modal-sprint-section">
              {/* --- Sprint Fields with Validation --- */}
              <div className="response-modal-form-section">
                <label>Project Name</label>
                <input
                  type="text"
                  placeholder="Enter project name"
                  value={s.name}
                  onChange={(e) => handleSprintChange(idx, "name", e.target.value)}
                  className={validationErrors[idx]?.name ? 'input-error' : ''}
                />
                {validationErrors[idx]?.name && <p className="input-error-message">{validationErrors[idx].name}</p>}
              </div>
              <div className="response-modal-form-row">
                <div className="response-modal-form-section">
                    <label>Sprint Label</label>
                    <input
                      type="text"
                      placeholder="Enter a label for the sprint"
                      value={s.label}
                      onChange={(e) => handleSprintChange(idx, "label", e.target.value)}
                      className={validationErrors[idx]?.label ? 'input-error' : ''}
                    />
                    {validationErrors[idx]?.label && <p className="input-error-message">{validationErrors[idx].label}</p>}
                </div>
                <div className="response-modal-form-section">
                    <label>Estimated Time (weeks)</label>
                    <input
                      type="number"
                      min={1}
                      placeholder="e.g. 4"
                      value={s.estimatedDuration}
                      onChange={(e) => handleSprintChange(idx, "estimatedDuration", e.target.value)}
                      className={validationErrors[idx]?.estimatedDuration ? 'input-error' : ''}
                      onKeyDown={e => {
                        if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                      }}
                    />
                    {validationErrors[idx]?.estimatedDuration && <p className="input-error-message">{validationErrors[idx].estimatedDuration}</p>}
                </div>
              </div>
              <div className="response-modal-form-row">
                <div className="response-modal-form-section">
                    <label>Sprint Type</label>
                    <select
                      value={s.type}
                      onChange={(e) => handleSprintChange(idx, "type", e.target.value)}
                      className={validationErrors[idx]?.type ? 'input-error' : ''}
                    >
                      <option value="">Select type</option>
                      {SPRINT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    {validationErrors[idx]?.type && <p className="input-error-message">{validationErrors[idx].type}</p>}
                </div>
                <div className="response-modal-form-section">
                    <label>Priority</label>
                    <select
                      value={s.priority}
                      onChange={(e) => handleSprintChange(idx, "priority", e.target.value)}
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                </div>
              </div>
              <div className="response-modal-form-section">
                  <label>Sprint Objective</label>
                  <input
                    type="text"
                    placeholder="Objective"
                    value={s.objective}
                    onChange={(e) => handleSprintChange(idx, "objective", e.target.value)}
                    className={validationErrors[idx]?.objective ? 'input-error' : ''}
                  />
                  {validationErrors[idx]?.objective && <p className="input-error-message">{validationErrors[idx].objective}</p>}
              </div>
              <div className="response-modal-form-section">
                  <label>Deliverables</label>
                  <textarea
                    placeholder="Describe deliverables"
                    value={s.deliverables}
                    onChange={(e) => handleSprintChange(idx, "deliverables", e.target.value)}
                    className={validationErrors[idx]?.deliverables ? 'input-error' : ''}
                  ></textarea>
                  {validationErrors[idx]?.deliverables && <p className="input-error-message">{validationErrors[idx].deliverables}</p>}
              </div>

              {/* --- Credit Tiers with Validation --- */}
              <div className="response-modal-section">
                <h3 className="response-modal-section-title response-modal-title" style={{ color: "#101828", fontSize: 24, fontWeight: 600 }}>
                  Taotter Credits
                </h3>
                <p className="response-modal-section-subtitle">
                  Select and configure the credit tiers you want to offer for this sprint.
                </p>
                {validationErrors[idx]?.tierError && <p className="input-error-message" style={{marginBottom: '16px'}}>{validationErrors[idx].tierError}</p>}
                
                {creditTiers.map((tier, tierIdx) => (
                  <div className="response-modal-credit-tier" key={tier.key}>
                    <div className="response-modal-credit-tier-header" style={{ display: "flex", alignItems: "center" }}>
                      <label className="response-modal-tier-checkbox" style={{ display: "flex", alignItems: "center" }}>
                        <input
                          type="checkbox"
                          checked={s.enabledTiers[tier.key]}
                          onChange={() => handleTierToggle(idx, tier.key)}
                        />
                        {editingTierIdx === tierIdx ? (
                          <>
                            <input
                              type="text"
                              value={editingTierValue}
                              onChange={e => setEditingTierValue(e.target.value)}
                              style={{ marginLeft: 8, fontSize: 16, fontWeight: 500, width: 260 }}
                              autoFocus
                            />
                            <img
                              src="/assets/icons/check-mark.svg"
                              alt="Save"
                              style={{ width: 18, height: 18, marginLeft: 8, cursor: "pointer" }}
                              onClick={() => {
                                setCreditTiers(prev =>
                                  prev.map((t, i) =>
                                    i === tierIdx ? { ...t, label: editingTierValue } : t
                                  )
                                );
                                setEditingTierIdx(null);
                              }}
                            />
                            <img
                              src="/assets/icons/stop.svg"
                              alt="Cancel"
                              style={{ width: 18, height: 18, marginLeft: 8, cursor: "pointer" }}
                              onClick={() => {
                                setEditingTierIdx(null);
                                setEditingTierValue(creditTiers[tierIdx].label);
                              }}
                            />
                          </>
                        ) : (
                          <>
                            <span className="response-modal-credit-tier-label" style={{ marginLeft: 8 }}>
                              {tier.label}
                            </span>
                            <img
                              src="/assets/icons/pencil.svg"
                              alt="Edit"
                              style={{ width: 16, height: 16, marginLeft: 8, cursor: "pointer" }}
                              onClick={() => {
                                setEditingTierIdx(tierIdx);
                                setEditingTierValue(tier.label);
                              }}
                            />
                          </>
                        )}
                      </label>
                    </div>
                    {s.enabledTiers[tier.key] && (
                      <div className="response-modal-credit-tier-fields">
                        <div className="response-modal-form-row">
                          <div className="response-modal-form-section">
                            <label>Hourly Rate</label>
                            <input
                              type="number" min={0} placeholder="Enter hourly rate"
                              className={`response-modal-input ${validationErrors[idx]?.packageOptions[tierIdx]?.hourlyRate ? 'input-error' : ''}`}
                              value={s.packageOptions[tierIdx].hourlyRate}
                              onChange={(e) => handlePackageChange(idx, tierIdx, "hourlyRate", e.target.value)}
                              onKeyDown={e => {
                                if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                              }}
                            />
                            {validationErrors[idx]?.packageOptions[tierIdx]?.hourlyRate && <p className="input-error-message">{validationErrors[idx]?.packageOptions[tierIdx]?.hourlyRate}</p>}
                          </div>
                          <div className="response-modal-form-section">
                            <label>Amount</label>
                            <input
                              type="number" min={0} placeholder="Enter amount"
                              className={`response-modal-input ${validationErrors[idx]?.packageOptions[tierIdx]?.amount ? 'input-error' : ''}`}
                              value={s.packageOptions[tierIdx].amount}
                              onChange={(e) => handlePackageChange(idx, tierIdx, "amount", e.target.value)}
                              onKeyDown={e => {
                                if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                              }}
                            />
                            {validationErrors[idx]?.packageOptions[tierIdx]?.amount && <p className="input-error-message">{validationErrors[idx]?.packageOptions[tierIdx]?.amount}</p>}
                          </div>
                        </div>
                        <div className="response-modal-form-row">
                            <div className="response-modal-form-section" style={{ width: "100%" }}>
                                <label>Payment Link (Stripe or other)</label>
                                <input
                                type="url" placeholder="https://your-stripe-link.com"
                                className="response-modal-input"
                                value={s.packageOptions[tierIdx].paymentLink || ""}
                                onChange={(e) => handlePackageChange(idx, tierIdx, "paymentLink", e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="response-modal-form-row">
                          <div className="response-modal-form-section">
                            <label>QTY (hours)</label>
                            <input
                              type="number" min={1} placeholder="Enter qty in hours"
                              className={`response-modal-input ${validationErrors[idx]?.packageOptions[tierIdx]?.qty ? 'input-error' : ''}`}
                              value={s.packageOptions[tierIdx].qty}
                              onChange={(e) => handlePackageChange(idx, tierIdx, "qty", e.target.value)}
                              onKeyDown={e => {
                                if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                              }}
                            />
                            {validationErrors[idx]?.packageOptions[tierIdx]?.qty && <p className="input-error-message">{validationErrors[idx]?.packageOptions[tierIdx]?.qty}</p>}
                          </div>
                          <div className="response-modal-form-section">
                            <label>Discount</label>
                            <input
                              type="number" min={0} placeholder="Enter discount"
                              className="response-modal-input"
                              value={s.packageOptions[tierIdx].discount}
                              onChange={(e) => handlePackageChange(idx, tierIdx, "discount", e.target.value)}
                              onKeyDown={e => {
                                if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {sprints.length > 1 && (
                <div style={{ marginTop: 8, marginBottom: 16 }}>
                  <button
                    type="button"
                    className="response-modal-remove-sprint"
                    style={{ color: "#ef4444", border: "none", background: "none", cursor: "pointer" }}
                    onClick={() =>
                      setSprints((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    Remove Sprint
                  </button>
                </div>
              )}
              <hr style={{ margin: "24px 0" }} />
            </div>
          ))}
          <button
            type="button"
            className="response-modal-add-sprint"
            style={{ width: 190, height: 44, alignSelf: "flex-start" }}
            onClick={handleAddSprint}
          >
            <span className="response-modal-add-icon">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 0.25C6.41421 0.25 6.75 0.585786 6.75 1V5.25H11C11.4142 5.25 11.75 5.58579 11.75 6C11.75 6.41421 11.4142 6.75 11 6.75H6.75V11C6.75 11.4142 6.41421 11.75 6 11.75C5.58579 11.75 5.25 11.4142 5.25 11V6.75H1C0.585786 6.75 0.25 6.41421 0.25 6C0.25 5.58579 0.585786 5.25 1 5.25H5.25V1C5.25 0.585786 5.58579 0.25 6 0.25Z" fill="#344054"/>
              </svg>
            </span>
            Create New Sprint
          </button>
          
          {apiError && <div className="input-error-message" style={{ marginTop: 12, fontSize: '14px' }}>{apiError}</div>}
          {success && <div style={{ color: "green", marginTop: 12 }}>{success}</div>}
          
          <div className="response-modal-footer">
            <button className="response-modal-submit" type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Sprint(s)"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
