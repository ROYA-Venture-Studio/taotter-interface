import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGetMySprintsQuery } from "../../store/api/sprintsApi";
import "./PaymentPendingPage.css";

const PaymentPendingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, isLoading, error } = useGetMySprintsQuery({}, { pollingInterval: 120000 });

  // Only show PaymentPendingPage if there is exactly one active (non-draft) sprint and it is unpaid
  const activeSprints = React.useMemo(() => {
    return (data?.data?.sprints || []).filter(sprint => sprint.status !== "draft");
  }, [data]);
  const unpaidActiveSprints = React.useMemo(() => {
    return activeSprints.filter(
      sprint => sprint.selectedPackage && sprint.selectedPackagePaymentStatus !== "paid"
    );
  }, [activeSprints]);

  React.useEffect(() => {
    if (
      !isLoading &&
      unpaidActiveSprints.length === 0 &&
      location.pathname === "/startup/payment-pending"
    ) {
      navigate("/startup/dashboard", { replace: true });
    }
  }, [isLoading, unpaidActiveSprints.length, navigate, location.pathname]);


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

  // Only show if there is at least one unpaid active sprint
  if (unpaidActiveSprints.length === 0) {
    return null;
  }

  return (
    <div className="payment-pending-bg">
      <div className="payment-pending-content">
        <div className="payment-pending-title">
          Awaiting Payment Confirmation
        </div>
        <div className="payment-pending-message">
          Your payment is being verified by our team.<br />
          You will be redirected to your dashboard once your payment is confirmed.<br /><br />
          If you have any questions, please contact support.
        </div>
      </div>
    </div>
  );
};

export default PaymentPendingPage;
