import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetSprintsQuery } from "../../store/api/sprintsApi";
import "./PaymentPendingPage.css";

const PaymentPendingPage = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetSprintsQuery({}, { pollingInterval: 120000 });

  useEffect(() => {
    console.log(data)
    if (data && Array.isArray(data.data.sprints)) {
      const paidSprint = data.data.sprints?.find(
        sprint => sprint.selectedPackagePaymentStatus === "paid"
      );
      if (paidSprint) {
        navigate("/startup/dashboard");
      }
    }
  }, [data, navigate]);

  if (isLoading) {
    return (
      <div className="payment-pending-bg">
        <div className="payment-pending-content">
          <div className="payment-pending-title">Checking Payment Status...</div>
          <div className="payment-pending-message">Please wait while we verify your payment.</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-pending-bg">
        <div className="payment-pending-content">
          <div className="payment-pending-title">Error</div>
          <div className="payment-pending-message">Failed to check payment status. Please refresh or contact support.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-pending-bg">
      <div className="payment-pending-content">
        <div className="payment-pending-title">
          Awaiting Payment Confirmation
        </div>
        <div className="payment-pending-message">
          Thank you for your payment!
          <br /><br />
          Your payment is being verified by our team.<br />
          You will be redirected to your dashboard once your payment is confirmed.<br /><br />
          If you have any questions, please contact support.
        </div>
      </div>
    </div>
  );
};

export default PaymentPendingPage;
