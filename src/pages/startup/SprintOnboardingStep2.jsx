import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui'
import { useGetSprintByIdQuery, useSelectPackageMutation } from '../../store/api/sprintsApi'
import longImage from '../../assets/images/long.png'
import leanSprintLogo from "../../assets/logo/LeanSprintNewLogo.png"
import './SprintOnboardingStep2.css'

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

const SprintOnboardingStep2 = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate()
  const { sprintId } = useParams()
  const [selectedTier, setSelectedTier] = useState(null)
  const [hasPaid, setHasPaid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { data: sprintData, isLoading, error } = useGetSprintByIdQuery(sprintId)
  const [selectPackage] = useSelectPackageMutation()

  const [creditTiers, setCreditTiers] = useState([])

  useEffect(() => {
    if (sprintData?.data?.sprint?.packageOptions) {
      const packages = sprintData.data.sprint.packageOptions
      
      const formattedTiers = packages.map((pkg) => {
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
          id: pkg._id,
          tierKey: pkg.tier || '',
          icon: '', // No emoji
          name: pkg.name,
          description: pkg.description || '',
          details: pkg.description || '',
          pricing,
          paymentLink: pkg.paymentLink || "",
          packageData: pkg
        }
      })

      setCreditTiers(formattedTiers)
    }
  }, [sprintData])

  const handleTierSelection = (tierId) => {
    setSelectedTier(tierId)
    setHasPaid(false)
  }

  const handlePay = (tier) => {
    if (tier.paymentLink) {
      window.open(tier.paymentLink, "_blank", "noopener,noreferrer")
      setHasPaid(true)
    }
  }

  const handleNext = async () => {
    if (!selectedTier) return
    
    setIsSubmitting(true)
    
    try {
      await selectPackage({
        id: sprintId,
        packageId: selectedTier
      }).unwrap()
      
      // Go to payment pending page instead of step 3
      navigate("/startup/payment-pending")
      
    } catch (error) {
      console.error('Error selecting package:', error)
      alert('Failed to select package. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    navigate(`/sprint/${sprintId}/onboarding/step-1`)
  }

  if (isLoading) {
    return (
      <div className="sprint-onboarding-page">
        {isMobile ? (
          <>
            <div className="sprint-onboarding-mobile-header">
              <div className="sprint-onboarding-mobile-header-title">
                Start Your Sprint
              </div>
            </div>
            <div className="sprint-onboarding-mobile-container">
              <div className="sprint-onboarding-mobile-title">
                Loading sprint details...
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
                Loading sprint details...
              </div>
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
    )
  }

  if (error || !sprintData?.data?.sprint) {
    return (
      <div className="sprint-onboarding-page">
        {isMobile ? (
          <>
            <div className="sprint-onboarding-mobile-header">
              <div className="sprint-onboarding-mobile-header-title">
                Start Your Sprint
              </div>
            </div>
            <div className="sprint-onboarding-mobile-container">
              <div className="sprint-onboarding-mobile-title">
                Error loading sprint details
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
                Error loading sprint details
              </div>
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
    )
  }

  if (creditTiers.length === 0) {
    return (
      <div className="sprint-onboarding-page">
        {isMobile ? (
          <>
            <div className="sprint-onboarding-mobile-header">
              <div className="sprint-onboarding-mobile-header-title">
                Start Your Sprint
              </div>
            </div>
            <div className="sprint-onboarding-mobile-container">
              <div className="sprint-onboarding-mobile-title">
                No credit tiers available
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
                No credit tiers available for this sprint
              </div>
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
    )
  }

  return (
    <div className="sprint-onboarding-page">
      {isMobile ? (
        <>
          <div className="sprint-onboarding-mobile-header">
            <img 
              src={leanSprintLogo} 
              alt="LeanSprint" 
              className="sprint-onboarding-mobile-logo" 
            />
            <button 
              onClick={handleBack}
              className="sprint-onboarding-mobile-back-btn"
            >
              Back
            </button>
          </div>
          <div className="sprint-onboarding-mobile-container">
            <div className="sprint-onboarding-mobile-title">
              Choose your preferred Leansprintr Credit Tier
            </div>
            <p>Select from the available tiers for {sprintData.data.sprint.name}</p>
            
            <div className="credit-tiers">
              {creditTiers.map((tier) => (
                <div key={tier.id} className="credit-tier-option">
                  <div className="tier-details">
                    <div className="tier-info">
                      <div className="tier-header">
                        <span className="tier-name">
                          {tier.name}
                        </span>
                        <div className="tier-description">{tier.description}</div>
                      </div>
                      
                      <div className="tier-pricing">
                        <div className="tier-details-text">{tier.details}</div>
                        {/* Pricing breakdown by model */}
                        {tier.pricing.model === "hourly" && (
                          <>
<div className="hourly-rate">
  <span className="current-rate">
    Hourly Rate: <span style={{ color: "#000" }}>{tier.pricing.hourlyRate}</span>
  </span>
</div>
<div className="tier-breakdown">
  <span className="breakdown-label">QTY:</span> {tier.pricing.qty}<br />
  <span className="breakdown-label">Discount:</span> {tier.pricing.discount}<br />
  <span className="breakdown-label">Subtotal:</span> {tier.pricing.subtotal}<br />
  {tier.pricing.discountAmount && (
    <>
      <span className="breakdown-label">Discount Amount:</span> {tier.pricing.discountAmount}<br />
    </>
  )}
</div>
                          </>
                        )}
{tier.pricing.model === "fixed" && (
  <div className="tier-breakdown">
    <span className="breakdown-label">Amount:</span> {tier.pricing.amount}<br />
    <span className="breakdown-label">Discount:</span> {tier.pricing.discount}<br />
    {tier.pricing.discountAmount && (
      <>
        <span className="breakdown-label">Discount Amount:</span> {tier.pricing.discountAmount}<br />
      </>
    )}
  </div>
)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="tier-action">
                    <div className="tier-total">{tier.pricing.total}</div>
                    <Button
                      variant="primary"
                      onClick={() => {
                        handleTierSelection(tier.id)
                        handlePay(tier)
                      }}
                      className={`tier-select-btn ${selectedTier === tier.id ? 'selected' : ''}`}
                    >
                      Pay
                    </Button>
                  </div>
                </div>
              ))}
            </div>

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
                disabled={!selectedTier || (creditTiers.find(t => t.id === selectedTier)?.paymentLink && !hasPaid) || isSubmitting}
                className="nav-button next-button"
              >
                {isSubmitting ? 'Selecting...' : 'Next'}
              </Button>
            </div>
          </div>
          
          <div className="sprint-onboarding-form-footer">
            <div className="sprint-onboarding-form-footer-left">
              All rights reserved
            </div>
            <div className="sprint-onboarding-form-footer-right">
              <a href="/terms" className="sprint-onboarding-terms-link">
                Terms of Services
              </a>
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
                onClick={handleBack}
                className="sprint-onboarding-desktop-back-btn"
              >
                Back to Home
              </button>
            </div>
            
            <div className="sprint-onboarding-content">
              <div className="sprint-onboarding-form-title">
                Choose your preferred Leansprintr Credit Tier
              </div>
              <div className="sprint-onboarding-form-subtitle">
                Select from the available tiers for {sprintData.data.sprint.name}
              </div>
            
            <div className="credit-tiers">
              {creditTiers.map((tier) => (
                <div key={tier.id} className="credit-tier-option">
                  <div className="tier-details">
                    <div className="tier-info">
                      <div className="tier-header">
                        <span className="tier-name">
                          {tier.icon} {tier.name}
                        </span>
                        <div className="tier-description">{tier.description}</div>
                      </div>
                      
<div className="tier-pricing">
  <div className="tier-details-text">{tier.details}</div>
  {/* Pricing breakdown by model */}
{tier.pricing.model === "hourly" && (
  <>
<div className="hourly-rate">
  <span className="current-rate">
    Hourly Rate: <span style={{ color: "#000" }}>{tier.pricing.hourlyRate}</span>
  </span>
</div>
    <div className="tier-breakdown">
      <span className="breakdown-label">QTY:</span> {tier.pricing.qty}<br />
      <span className="breakdown-label">Discount:</span> {tier.pricing.discount}<br />
      <span className="breakdown-label">Subtotal:</span> {tier.pricing.subtotal}<br />
      {tier.pricing.discountAmount && (
        <>
          <span className="breakdown-label">Discount Amount:</span> {tier.pricing.discountAmount}<br />
        </>
      )}
    </div>
  </>
)}
{tier.pricing.model === "fixed" && (
  <div className="tier-breakdown">
    <span className="breakdown-label">Amount:</span> {tier.pricing.amount}<br />
    <span className="breakdown-label">Discount:</span> {tier.pricing.discount}<br />
    {tier.pricing.discountAmount && (
      <>
        <span className="breakdown-label">Discount Amount:</span> {tier.pricing.discountAmount}<br />
      </>
    )}
  </div>
)}
</div>
                    </div>
                  </div>
                  
                  <div className="tier-action">
                    <div className="tier-total">{tier.pricing.total}</div>
                    {tier.paymentLink ? (
                      <Button
                        variant="primary"
                        onClick={() => {
                          handleTierSelection(tier.id)
                          handlePay(tier)
                        }}
                        className={`tier-select-btn ${selectedTier === tier.id ? 'selected' : ''}`}
                      >
                        Pay
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={() => handleTierSelection(tier.id)}
                        className={`tier-select-btn ${selectedTier === tier.id ? 'selected' : ''}`}
                      >
                        {selectedTier === tier.id ? 'Selected' : 'Select'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

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
                disabled={!selectedTier || (creditTiers.find(t => t.id === selectedTier)?.paymentLink && !hasPaid) || isSubmitting}
                className="sprint-onboarding-btn-next"
              >
                {isSubmitting ? 'Selecting...' : 'Next'}
              </Button>
            </div>
            
            <div className="sprint-onboarding-footer">
              <div className="sprint-onboarding-footer-left">
                  © Leansprintr 2025. All Rights Reserved
              </div>
              <div className="sprint-onboarding-footer-right">
                <a href="/terms" className="sprint-onboarding-terms-link">
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
          </div>
        </div>
      )}
    </div>
  )
}

export default SprintOnboardingStep2
