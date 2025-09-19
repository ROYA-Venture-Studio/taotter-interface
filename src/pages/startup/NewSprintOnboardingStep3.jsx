import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui";
import { useSelectPackageMutation, useGetSprintByIdQuery, useDeleteSprintMutation } from "../../store/api/sprintsApi";
import leanSprintLogo from "../../assets/logo/LeanSprintNewLogo.png";
import "./NewSprintOnboardingStep3.css";

export default function NewSprintOnboardingStep3() {
  const { questionnaireId, sprintId } = useParams();
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [selectPackage, { isLoading: selecting }] = useSelectPackageMutation();
  const [deleteSprint] = useDeleteSprintMutation();

  const { data: sprintData, isLoading: sprintLoading, error: sprintError } = useGetSprintByIdQuery(sprintId, { skip: !sprintId });
  const sprint = sprintData?.data?.sprint || null;

  // Compute credit tiers from sprint.packageOptions
  const creditTiers = sprint?.packageOptions
    ? sprint.packageOptions.map((pkg) => {
        const currency = pkg.currency || "QAR";
        let pricing = {};
        if (pkg.pricingModel === "hourly" || (pkg.hourlyRate && pkg.QTY)) {
          const hourlyRate = pkg.hourlyRate || 0;
          const qty = pkg.QTY || pkg.engagementHours || 0;
          const discountPercent = pkg.discount ? Number(pkg.discount) : 0;
          const subtotal = hourlyRate * qty;
          const discountAmount = subtotal * (discountPercent / 100);
          const total = subtotal - discountAmount;
          pricing = {
            model: "hourly",
            hourlyRate: `${currency} ${hourlyRate.toFixed(2)}/hour`,
            qty: `${qty} hours`,
            subtotal: `${currency} ${subtotal.toFixed(2)}`,
            discount: discountPercent ? `-${discountPercent}%` : '0%',
            discountAmount: discountPercent ? `-${currency} ${discountAmount.toFixed(2)}` : null,
            total: `${currency} ${total.toFixed(2)}`
          };
        } else if (pkg.pricingModel === "fixed" || pkg.amount) {
          const amount = pkg.amount || pkg.price || 0;
          const discountPercent = pkg.discount ? Number(pkg.discount) : 0;
          const discountAmount = amount * (discountPercent / 100);
          const total = amount - discountAmount;
          pricing = {
            model: "fixed",
            amount: `${currency} ${amount.toFixed(2)}`,
            discount: discountPercent ? `-${discountPercent}%` : '0%',
            discountAmount: discountPercent ? `-${currency} ${discountAmount.toFixed(2)}` : null,
            total: `${currency} ${total.toFixed(2)}`
          };
        }
        return {
          id: pkg.id || pkg._id,
          name: pkg.name,
          description: pkg.description || '',
          details: pkg.description || '',
          pricing,
          paymentLink: pkg.paymentLink || "",
          packageData: pkg
        }
      })
    : [];

  const handleTierSelection = (tierId) => {
    setSelectedPackage(tierId);
    setHasPaid(false);
  };

  const handlePayAndSelect = async (tier) => {
    if (!sprint || !tier) return;
    try {
      await selectPackage({ id: sprint.id, packageId: tier.id }).unwrap();
      if (tier.paymentLink) window.open(tier.paymentLink, "_blank", "noopener,noreferrer");
      setHasPaid(true);

      // Delete draft sprint after payment
      const draftSprintId = localStorage.getItem("draftSprintId");
      if (draftSprintId) {
        try {
          await deleteSprint(draftSprintId).unwrap();
        } catch (err) {
          // Optionally handle error, e.g. log or ignore
        }
        localStorage.removeItem("draftSprintId");
      }

      navigate("/startup/dashboard");
    } catch (error) {
      alert("Failed to select package. Please try again.");
    }
  };

  const handleBack = () => {
    navigate("/startup/dashboard");
  };

  return (
    <div className="ns-step3-page">
      {/* Mobile Header */}
      <div className="ns-step3-mobile-header">
        <img src={leanSprintLogo} alt="LeanSprint" className="ns-step3-mobile-logo" />
        <button className="ns-step3-mobile-back-btn" onClick={handleBack}>
          Back
        </button>
      </div>

      {/* Desktop Header */}
      <div className="ns-step3-desktop-header">
        <img src={leanSprintLogo} alt="LeanSprint" className="ns-step3-desktop-logo" />
        <button className="ns-step3-desktop-back-btn" onClick={handleBack}>
          Back
        </button>
      </div>

      <div className="ns-step3-container">
        <div className="ns-step3-form-title">Step 3: Select Package & Payment</div>
        <div className="ns-step3-form-subtitle">
          Choose a sprint package to continue. After selection, complete payment if required.
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
        ) : creditTiers.length === 0 ? (
          <div>
            <p>No packages available for this sprint.</p>
          </div>
        ) : (
          <div className="ns-step3-credit-tiers">
            {creditTiers.map((tier) => (
              <div
                key={tier.id}
                className={`ns-step3-credit-tier-option${selectedPackage === tier.id ? " selected" : ""}`}
              >
                <div className="ns-step3-tier-details">
                  <div className="ns-step3-tier-info">
                    <div className="ns-step3-tier-header">
                      <div className="ns-step3-tier-name">{tier.name}</div>
                      <div className="ns-step3-tier-description">{tier.description}</div>
                    </div>
                    <div className="ns-step3-tier-pricing">
                      <div className="ns-step3-tier-details-text">{tier.details}</div>
                      {tier.pricing.model === "hourly" && (
                        <>
                          <div className="ns-step3-hourly-rate">
                            <span className="ns-step3-current-rate">
                              Hourly Rate: {tier.pricing.hourlyRate}
                            </span>
                          </div>
                          <div className="ns-step3-tier-breakdown">
                            <span className="ns-step3-breakdown-label">QTY:</span> {tier.pricing.qty}<br />
                            <span className="ns-step3-breakdown-label">Discount:</span> {tier.pricing.discount}<br />
                            <span className="ns-step3-breakdown-label">Subtotal:</span> {tier.pricing.subtotal}<br />
                            {tier.pricing.discountAmount && (
                              <>
                                <span className="ns-step3-breakdown-label">Discount Amount:</span> {tier.pricing.discountAmount}<br />
                              </>
                            )}
                          </div>
                        </>
                      )}
                      {tier.pricing.model === "fixed" && (
                        <div className="ns-step3-tier-breakdown">
                          <span className="ns-step3-breakdown-label">Amount:</span> {tier.pricing.amount}<br />
                          <span className="ns-step3-breakdown-label">Discount:</span> {tier.pricing.discount}<br />
                          {tier.pricing.discountAmount && (
                            <>
                              <span className="ns-step3-breakdown-label">Discount Amount:</span> {tier.pricing.discountAmount}<br />
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ns-step3-tier-action">
                    <div className="ns-step3-tier-total">{tier.pricing.total}</div>
                    <button
                      onClick={() => {
                        handleTierSelection(tier.id);
                        handlePayAndSelect(tier);
                      }}
                      className={`ns-step3-tier-select-btn${selectedPackage === tier.id ? " selected" : ""}`}
                      disabled={selecting}
                    >
                      Pay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="ns-step3-form-footer">
        <span className="ns-step3-form-footer-left">© Leansprintr 2025. All Rights Reserved</span>
        <span className="ns-step3-form-footer-right">Terms of Services</span>
      </div>
    </div>
  );
}
