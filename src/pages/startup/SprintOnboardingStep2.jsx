import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui'
import { useGetSprintByIdQuery, useSelectPackageMutation } from '../../store/api/sprintsApi'
import longImage from '../../assets/images/long.png'
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
      
      const tierMapping = {
        'starter': { icon: '🚀', baseDescription: 'For engagements between 10 to 150 hours' },
        'growth': { icon: '🌱', baseDescription: 'For engagements between 151 to 250 hours' },
        'scale': { icon: '🏗', baseDescription: 'For engagements of 251 hours or more' }
      }

      const formattedTiers = packages.map((pkg, index) => {
        const tierKey = pkg.tier || 'starter'
        const tierInfo = tierMapping[tierKey] || tierMapping['starter']
        
        // Calculate hourly rate: use pkg.hourlyRate if present, else price/engagementHours
        const currency = pkg.currency || "QAR";
        const hourlyRate = pkg.hourlyRate && pkg.hourlyRate > 0
          ? pkg.hourlyRate
          : (pkg.engagementHours > 0 ? (pkg.price || 0) / pkg.engagementHours : 0);
        const estimatedHours = pkg.engagementHours || 0;
        const discountPercent = pkg.discount ? Number(pkg.discount) : 0;
        const subtotal = hourlyRate * estimatedHours;
        const discountAmount = subtotal * (discountPercent / 100);
        const total = subtotal - discountAmount;
        return {
          id: pkg._id,
          tierKey: tierKey,
          icon: tierInfo.icon,
          name: pkg.name.split(':')[0].replace(/🚀|🌱|🏗/g, '').trim(),
          description: pkg.name.split(':')[1]?.trim() || tierInfo.baseDescription,
          hourlyRate: `${currency} ${hourlyRate.toFixed(2)}/hour`,
          originalRate: null,
          details: pkg.description || 'Sprint package details',
          idealFor: `Ideal for ${estimatedHours} hours of engagement`,
          pricing: {
            estimatedHours: estimatedHours,
            discount: discountPercent ? `-${discountPercent}%` : '0%',
            subtotal: `${currency} ${subtotal.toFixed(2)}`,
            discountAmount: discountPercent ? `-${currency} ${discountAmount.toFixed(2)}` : null,
            total: `${currency} ${total.toFixed(2)}`
          },
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
            <div className="sprint-onboarding-mobile-header-title">
              Start Your Sprint
            </div>
          </div>
          <div className="sprint-onboarding-mobile-container">
            <div className="sprint-onboarding-mobile-title">
              Choose your preferred Taotter Credit Tier
            </div>
            <p>Select from the available tiers for {sprintData.data.sprint.name}</p>
            
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
                        <div className="hourly-rate">
                          <span className="current-rate">
                            Hourly Rate: {tier.hourlyRate}
                          </span>
                        </div>
                        
                        <div className="tier-details-text">{tier.details}</div>
                        <div className="tier-ideal">{tier.idealFor}</div>
                        <div className="tier-breakdown">
                          <span className="breakdown-label">Estimated Hours:</span> {tier.pricing.estimatedHours} hours<br />
                          <span className="breakdown-label">Engagement Hours:</span> {tier.packageData.engagementHours}<br />
                          <span className="breakdown-label">Discount:</span> {tier.pricing.discount}<br />
                          <span className="breakdown-label">Subtotal:</span> {tier.pricing.subtotal}<br />
                          {tier.pricing.discountAmount && (
                            <>
                              <span className="breakdown-label">Discount Amount:</span> {tier.pricing.discountAmount}<br />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="tier-action">
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
                    <div className="tier-total">{tier.pricing.total}</div>
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
        </>
      ) : (
        <div className="sprint-onboarding-split-container">
          <div className="sprint-onboarding-left">
            <div className="sprint-onboarding-form-title">
              Choose your preferred Taotter Credit Tier
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
                        <div className="hourly-rate">
                          <span className="current-rate">
                            Hourly Rate: {tier.hourlyRate}
                          </span>
                        </div>
                        
                        <div className="tier-details-text">{tier.details}</div>
                        <div className="tier-ideal">{tier.idealFor}</div>
                        <div className="tier-breakdown">
                          <span className="breakdown-label">Estimated Hours:</span> {tier.pricing.estimatedHours} hours<br />
                          <span className="breakdown-label">Discount:</span> {tier.pricing.discount}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="tier-action">
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
                    <div className="tier-total">{tier.pricing.total}</div>
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
