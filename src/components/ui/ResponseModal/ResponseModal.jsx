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

const CREDIT_TIERS = [
  {
    label: "🚀 Starter: Engagements between 10 to 150 hours",
    key: "starter",
  },
  {
    label: "🌱 Growth: For engagements between 151 to 250 hours",
    key: "growth",
  },
  {
    label: "🏗️ Scale: For engagements of 251 hours or more",
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

export default function ResponseModal({ onClose }) {
  const { id: questionnaireId } = useParams();
  const [sprints, setSprints] = useState([emptySprint()]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createSprints, { isLoading }] = useCreateSprintsForQuestionnaireMutation();

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

  // Validate all fields
  const validate = () => {
    for (let i = 0; i < sprints.length; i++) {
      const s = sprints[i];
      if (
        !s.name ||
        !s.type ||
        !s.estimatedDuration ||
        !s.priority ||
        !s.objective ||
        !s.deliverables
      ) {
        setError(`All sprint fields are required for Sprint ${i + 1}.`);
        return false;
      }

      // Check if at least one tier is enabled
      const hasEnabledTier = Object.values(s.enabledTiers).some(enabled => enabled);
      if (!hasEnabledTier) {
        setError(`At least one credit tier must be enabled for Sprint ${i + 1}.`);
        return false;
      }

      // Validate only enabled tiers
      for (let j = 0; j < 3; j++) {
        const tierKey = CREDIT_TIERS[j].key;
        if (s.enabledTiers[tierKey]) {
          const p = s.packageOptions[j];
          if (!p.hourlyRate || !p.amount || !p.qty) {
            setError(
              `All fields are required for enabled tier "${CREDIT_TIERS[j].label}" in Sprint ${i + 1}.`
            );
            return false;
          }
        }
      }
    }
    setError("");
    return true;
  };

  // Prepare payload for API
  const preparePayload = () => {
    return sprints.map((s) => ({
      name: s.name,
      description: s.objective + "\n\nDeliverables:\n" + s.deliverables,
      type: s.type,
      estimatedDuration: parseInt(s.estimatedDuration, 10) || 1,
      priority: s.priority,
      packageOptions: s.packageOptions
        .filter((p, idx) => s.enabledTiers[CREDIT_TIERS[idx].key])
        .map((p, originalIdx) => {
          const tierIndex = s.packageOptions.indexOf(p);
          return {
            name: CREDIT_TIERS[tierIndex].label,
            description: s.objective,
            price: parseFloat(p.amount) || 0,
            currency: "USD",
            engagementHours: parseInt(p.qty, 10) || 0,
            duration: parseInt(s.estimatedDuration, 10) || 1,
            features: [],
            teamSize: 1,
            communicationLevel: "standard",
            isRecommended: CREDIT_TIERS[tierIndex].key === "growth",
            deliverables: [{ 
              name: "Deliverables", 
              description: s.deliverables, 
              estimatedHours: parseInt(p.qty, 10) || 0 
            }],
            hourlyRate: parseFloat(p.hourlyRate) || 0,
            discount: p.discount ? parseFloat(p.discount) : 0,
            tier: p.tier,
            paymentLink: p.paymentLink || "", // <-- Ensure paymentLink is included
          };
        }),
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
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
      setError(
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
        <form className="response-modal-form" onSubmit={handleSubmit}>
          {sprints.map((s, idx) => (
            <div key={idx} className="response-modal-sprint-section">
              {/* RESTORED FIELDS */}
              <div className="response-modal-form-section">
                <label>
                  Project Name
                  <input
                    type="text"
                    placeholder="Enter project name"
                    value={s.name}
                    onChange={(e) => handleSprintChange(idx, "name", e.target.value)}
                  />
                </label>
              </div>
              <div className="response-modal-form-row">
                <div className="response-modal-form-section">
                  <label>
                    Sprint Label
                    <input
                      type="text"
                      placeholder="Enter a label for the sprint"
                      value={s.label}
                      onChange={(e) => handleSprintChange(idx, "label", e.target.value)}
                    />
                  </label>
                </div>
                <div className="response-modal-form-section">
                  <label>
                    Estimated Time (weeks)
                    <input
                      type="number"
                      min={1}
                      placeholder="e.g. 4"
                      value={s.estimatedDuration}
                      onChange={(e) => handleSprintChange(idx, "estimatedDuration", e.target.value)}
                    />
                  </label>
                </div>
              </div>
              <div className="response-modal-form-row">
                <div className="response-modal-form-section">
                  <label>
                    Sprint Type
                    <select
                      value={s.type}
                      onChange={(e) => handleSprintChange(idx, "type", e.target.value)}
                    >
                      <option value="">Select type</option>
                      {SPRINT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="response-modal-form-section">
                  <label>
                    Priority
                    <select
                      value={s.priority}
                      onChange={(e) => handleSprintChange(idx, "priority", e.target.value)}
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              <div className="response-modal-form-section">
                <label>
                  Sprint Objective
                  <input
                    type="text"
                    placeholder="Objective"
                    value={s.objective}
                    onChange={(e) => handleSprintChange(idx, "objective", e.target.value)}
                  />
                </label>
              </div>
              <div className="response-modal-form-section">
                <label>
                  Deliverables
                  <textarea
                    placeholder="Describe deliverables"
                    value={s.deliverables}
                    onChange={(e) => handleSprintChange(idx, "deliverables", e.target.value)}
                  ></textarea>
                </label>
              </div>
              {/* END RESTORED FIELDS */}

              <div className="response-modal-section">
                <h3 className="response-modal-section-title response-modal-title" style={{ color: "#101828", fontSize: 24, fontWeight: 600 }}>
                  Taotter Credits
                </h3>
                <p className="response-modal-section-subtitle">
                  Select and configure the credit tiers you want to offer for this sprint.
                </p>
                {CREDIT_TIERS.map((tier, tierIdx) => (
                  <div className="response-modal-credit-tier" key={tier.key}>
                    <div className="response-modal-credit-tier-header">
                      <label className="response-modal-tier-checkbox">
                        <input
                          type="checkbox"
                          checked={s.enabledTiers[tier.key]}
                          onChange={() => handleTierToggle(idx, tier.key)}
                        />
                        <span className="response-modal-credit-tier-label">{tier.label}</span>
                      </label>
                    </div>
                    {s.enabledTiers[tier.key] && (
                      <div className="response-modal-credit-tier-fields">
                        <div className="response-modal-form-row">
                          <div className="response-modal-form-section">
                            <label>
                              Hourly Rate
                              <input
                                type="number"
                                min={0}
                                placeholder="Enter hourly rate"
                                className="response-modal-input"
                                value={s.packageOptions[tierIdx].hourlyRate}
                                onChange={(e) =>
                                  handlePackageChange(idx, tierIdx, "hourlyRate", e.target.value)
                                }
                              />
                            </label>
                          </div>
                          <div className="response-modal-form-section">
                            <label>
                              Amount
                              <input
                                type="number"
                                min={0}
                                placeholder="Enter amount"
                                className="response-modal-input"
                                value={s.packageOptions[tierIdx].amount}
                                onChange={(e) =>
                                  handlePackageChange(idx, tierIdx, "amount", e.target.value)
                                }
                              />
                            </label>
                          </div>
                        </div>
                        <div className="response-modal-form-row">
                          <div className="response-modal-form-section" style={{ width: "100%" }}>
                            <label>
                              Payment Link (Stripe or other)
                              <input
                                type="url"
                                placeholder="https://your-stripe-link.com"
                                className="response-modal-input"
                                value={s.packageOptions[tierIdx].paymentLink || ""}
                                onChange={(e) =>
                                  handlePackageChange(idx, tierIdx, "paymentLink", e.target.value)
                                }
                              />
                            </label>
                          </div>
                        </div>
                        <div className="response-modal-form-row">
                          <div className="response-modal-form-section">
                            <label>
                              QTY (hours)
                              <input
                                type="number"
                                min={1}
                                placeholder="Enter qty in hours"
                                className="response-modal-input"
                                value={s.packageOptions[tierIdx].qty}
                                onChange={(e) =>
                                  handlePackageChange(idx, tierIdx, "qty", e.target.value)
                                }
                              />
                            </label>
                          </div>
                          <div className="response-modal-form-section">
                            <label>
                              Discount
                              <input
                                type="number"
                                min={0}
                                placeholder="Enter discount"
                                className="response-modal-input"
                                value={s.packageOptions[tierIdx].discount}
                                onChange={(e) =>
                                  handlePackageChange(idx, tierIdx, "discount", e.target.value)
                                }
                              />
                            </label>
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
          {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
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
