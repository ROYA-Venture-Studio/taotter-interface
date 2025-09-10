import React from "react";
import "./SignupSection.css";

export default function SignupSection() {
  return (
    <section className="signup-section">
      <div className="signup-container">
        <div className="google-signup">
          <div className="google-button">
            <svg className="google-icon" width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M32.3403 20.2958C32.3403 19.374 32.2576 18.4876 32.104 17.6367H19.8604V22.6654H26.8567C26.5553 24.2904 25.6394 25.6672 24.2626 26.589V29.8508H28.464C30.9222 27.5876 32.3403 24.2549 32.3403 20.2958Z" fill="#4285F4"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M19.8604 32.9997C23.3704 32.9997 26.3132 31.8356 28.4641 29.8502L24.2627 26.5884C23.0986 27.3684 21.6095 27.8293 19.8604 27.8293C16.4745 27.8293 13.6086 25.5425 12.5863 22.4697H8.24316V25.8379C10.3823 30.0865 14.7786 32.9997 19.8604 32.9997Z" fill="#34A853"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M12.5863 22.4703C12.3263 21.6903 12.1785 20.8571 12.1785 20.0003C12.1785 19.1435 12.3263 18.3103 12.5863 17.5303V14.1621H8.24308C7.36262 15.9171 6.86035 17.9026 6.86035 20.0003C6.86035 22.098 7.36262 24.0835 8.24308 25.8385L12.5863 22.4703Z" fill="#FBBC05"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M19.8604 12.1705C21.7691 12.1705 23.4827 12.8264 24.83 14.1145L28.5586 10.3859C26.3073 8.28818 23.3645 7 19.8604 7C14.7786 7 10.3823 9.91318 8.24316 14.1618L12.5863 17.53C13.6086 14.4573 16.4745 12.1705 19.8604 12.1705Z" fill="#EA4335"/>
            </svg>
            <span>Sign up with Google</span>
          </div>
          <p className="no-credit-card">No credit card required.</p>
        </div>
      </div>
    </section>
  );
}
