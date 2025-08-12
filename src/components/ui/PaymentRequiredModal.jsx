import React from "react";

const PaymentRequiredModal = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="payment-required-modal-backdrop" style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.4)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div className="payment-required-modal" style={{
        background: "#fff",
        borderRadius: 8,
        padding: "2rem",
        maxWidth: 400,
        boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
        textAlign: "center"
      }}>
        <h2 style={{ color: "#e53e3e", marginBottom: 16 }}>Payment Required</h2>
        <p style={{ marginBottom: 24 }}>
          This board cannot be accessed until payment is confirmed.<br />
          Please complete payment for the associated sprint to unlock this feature.
        </p>
        <button
          onClick={onClose}
          style={{
            background: "#e53e3e",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "0.5rem 1.5rem",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PaymentRequiredModal;
