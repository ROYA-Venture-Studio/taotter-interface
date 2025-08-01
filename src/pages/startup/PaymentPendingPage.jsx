import React from "react";
import "./PaymentPendingPage.css";

const PaymentPendingPage = () => (
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

export default PaymentPendingPage;
