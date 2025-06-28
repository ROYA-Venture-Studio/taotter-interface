import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui'
import { useGetSprintByIdQuery, useSelectPackageMutation } from '../../store/api/sprintsApi'
import './SprintOnboardingStep2.css'

const SprintOnboardingStep2 = () => {
  const navigate = useNavigate()
  const { sprintId } = useParams()
  const [selectedTier, setSelectedTier] = useState(null)
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
        
        // Calculate hourly rate: total amount / number of hours
        const calculatedHourlyRate = pkg.engagementHours > 0 ? (pkg.price || 0) / pkg.engagementHours : 0
        
        return {
          id: pkg._id,
          tierKey: tierKey,
          icon: tierInfo.icon,
          name: pkg.name.split(':')[0].replace(/🚀|🌱|🏗/g, '').trim(),
          description: pkg.name.split(':')[1]?.trim() || tierInfo.baseDescription,
          hourlyRate: `QAR ${calculatedHourlyRate.toFixed(2)}/hour`,
          originalRate: null,
          details: pkg.description || 'Sprint package details',
          idealFor: `Ideal for ${pkg.engagementHours} hours of engagement`,
          pricing: {
            amount: `QAR ${calculatedHourlyRate.toFixed(2)}`,
            quantity: pkg.engagementHours || 0,
            discount: pkg.discount ? `-${pkg.discount}%` : '0%',
            total: `QAR ${(pkg.price || 0).toFixed(2)}`
          },
          packageData: pkg
        }
      })

      setCreditTiers(formattedTiers)
      
      // DO NOT auto-select any package - let user choose
      // Remove any previous auto-selection logic
    }
  }, [sprintData])

  const handleTierSelection = (tierId) => {
    setSelectedTier(tierId)
  }

  const handleNext = async () => {
    if (!selectedTier) return
    
    setIsSubmitting(true)
    
    try {
      await selectPackage({
        id: sprintId,
        packageId: selectedTier
      }).unwrap()
      
      navigate(`/sprint/${sprintId}/onboarding/step-3`)
      
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
        <div className="sprint-onboarding-card">
          <div className="loading">Loading sprint details...</div>
        </div>
      </div>
    )
  }

  if (error || !sprintData?.data?.sprint) {
    return (
      <div className="sprint-onboarding-page">
        <div className="sprint-onboarding-card">
          <div className="error">Error loading sprint details.</div>
        </div>
      </div>
    )
  }

  if (creditTiers.length === 0) {
    return (
      <div className="sprint-onboarding-page">
        <div className="sprint-onboarding-card">
          <div className="error">No credit tiers available for this sprint.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="sprint-onboarding-page">
      <div className="sprint-onboarding-card credit-tier-card">
        <div className="sprint-onboarding-header">
          <h1>Start Your Sprint</h1>
        </div>
        
        <div className="sprint-onboarding-content">
          <div className="onboarding-title">
            <h2>Choose your preferred Taotter Credit Tier</h2>
            <p>Select from the available tiers for {sprintData.data.sprint.name}</p>
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
                        <span className="breakdown-label">Amount:</span> {tier.pricing.amount} <br />
                        <span className="breakdown-label">Qty:</span> {tier.pricing.quantity} hours<br />
                        <span className="breakdown-label">Discount:</span> {tier.pricing.discount}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="tier-action">
                  <Button
                    variant="primary"
                    onClick={() => handleTierSelection(tier.id)}
                    className={`tier-select-btn ${selectedTier === tier.id ? 'selected' : ''}`}
                  >
                    {selectedTier === tier.id ? 'Selected' : 'Select'}
                  </Button>
                  <div className="tier-total">{tier.pricing.total}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="onboarding-navigation">
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
              disabled={!selectedTier || isSubmitting}
              className="nav-button next-button"
            >
              {isSubmitting ? 'Selecting...' : 'Select Package'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SprintOnboardingStep2
