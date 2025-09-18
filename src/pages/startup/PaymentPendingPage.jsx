import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetMySprintsQuery } from "../../store/api/sprintsApi";
import leanSprintLogo from "../../assets/logo/LeanSprintNewLogo.png";
import paymentImage from "../../assets/images/payment.png";
import "./PaymentPendingPage.css";

const PaymentPendingPage = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetMySprintsQuery();

  // Remove the automatic redirect logic - let StartupOnboardingGuard handle navigation
  // This prevents the circular navigation issue

  if (isLoading) {
    return (
      <div className="payment-pending-page">
        {/* Header */}
        <div className="payment-pending-header">
          <div className="payment-pending-logo">
            <img src={leanSprintLogo} alt="LeanSprint" className="logo-image" />
          </div>
          <button className="payment-pending-back-btn" onClick={() => navigate("/")}>
            Back to home
          </button>
        </div>

        {/* Main Content */}
        <div className="payment-pending-main">
          <div className="payment-pending-modal">
            <img src={paymentImage} alt="Payment" className="payment-pending-image" />
            <h1 className="payment-pending-title">Checking Payment Status...</h1>
            <p className="payment-pending-message">Please wait while we verify your payment.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="payment-pending-footer">
          <div className="payment-pending-footer-left">
© Leansprintr 2025. All Rights Reserved          </div>
          <div className="payment-pending-footer-right">
            <a href="/terms" className="payment-pending-terms-link">
              Terms of Services
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-pending-page">
        {/* Header */}
        <div className="payment-pending-header">
          <div className="payment-pending-logo">
            <img src={leanSprintLogo} alt="LeanSprint" className="logo-image" />
          </div>
          <button className="payment-pending-back-btn" onClick={() => navigate("/")}>
            Back to home
          </button>
        </div>

        {/* Main Content */}
        <div className="payment-pending-main">
          <div className="payment-pending-modal">
            <img src={paymentImage} alt="Payment" className="payment-pending-image" />
            <h1 className="payment-pending-title">Error</h1>
            <p className="payment-pending-message">Failed to check payment status. Please refresh or contact support.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="payment-pending-footer">
          <div className="payment-pending-footer-left">
© Leansprintr 2025. All Rights Reserved          </div>
          <div className="payment-pending-footer-right">
            <a href="/terms" className="payment-pending-terms-link">
              Terms of Services
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-pending-page">
      {/* Header */}
      <div className="payment-pending-header">
        <div className="payment-pending-logo">
          <img src={leanSprintLogo} alt="LeanSprint" className="logo-image" />
        </div>
        <button className="payment-pending-back-btn" onClick={() => navigate("/")}>
          Back to home
        </button>
      </div>

      {/* Main Content */}
      <div className="payment-pending-main">
        <div className="payment-pending-modal">
          <img src={paymentImage} alt="Payment" className="payment-pending-image" />
          <h1 className="payment-pending-title">
            Awaiting Payment Confirmation
          </h1>
          <p className="payment-pending-subtitle">
            Thank you for your payment!
          </p>
          
          <div className="payment-pending-content">
            <p className="payment-pending-description">
              Your payment is being verified by our team.<br />
              You will be redirected to your dashboard once your payment is confirmed.<br /><br />
              If you have any questions, please contact support.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="payment-pending-footer">
        <div className="payment-pending-footer-left">
© Leansprintr 2025. All Rights Reserved        </div>
        <div className="payment-pending-footer-right">
          <a href="/terms" className="payment-pending-terms-link">
            Terms of Services
          </a>
        </div>
      </div>
    </div>
  );
};

export default PaymentPendingPage;
