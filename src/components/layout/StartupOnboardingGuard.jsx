import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../store/slices/authSlice";
import { useGetMySprintsQuery } from "../../store/api/sprintsApi";

// Simple loading spinner
const LoadingSpinner = () => (
  <div style={{
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#101010"
  }}>
    <div style={{
      color: "#fff",
      fontSize: "1.5rem",
      fontWeight: 600,
      letterSpacing: "1px"
    }}>
      Loading...
    </div>
  </div>
);

const StartupOnboardingGuard = ({ children }) => {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  // Always call the hook, but handle undefined user inside the effect
  const { data: sprintsData, isLoading } = useGetMySprintsQuery();

  useEffect(() => {
    if (!user || !user.onboarding) return;
    
    // Check for unpaid sprints with selected packages
    const unpaidSprint = sprintsData?.data?.sprints?.find(
      (s) =>
        s.selectedPackage &&
      s.status === "package_selected" &&
      (s.selectedPackagePaymentStatus !== "paid" && s.selectedPackagePaymentStatus !== "PAID")
    );
    
    console.log(user.onboarding.currentStep)
    if (unpaidSprint) {
      if (window.location.pathname !== "/startup/payment-pending") {
        navigate("/startup/payment-pending", { replace: true });
      }
      return;
    }

    // If all sprints are paid, allow access to dashboard/active sprint
    if (window.location.pathname === "/startup/payment-pending") {
      navigate("/startup/dashboard", { replace: true });
      return;
    }
    // Fallback to onboarding logic for other steps
    switch (user.onboarding.currentStep) {
      case "sprint_selection":
        navigate("/startup/dashboard", { replace: true });
        break;
      case "document_upload":
        // If you still have a document upload step, redirect accordingly
        // navigate("/sprint/:sprintId/onboarding/step-1", { replace: true });
        break;
      case "meeting_scheduling":
        // Add meeting scheduling route if needed
        break;
      case "active_sprint":
        navigate("/startup/dashboard", { replace: true });
        break;
      default:
        // No-op or fallback
        break;
    }
  }, [user, navigate, sprintsData]);

  // Show loading spinner while fetching sprints or user not loaded
  if (!user || !user.onboarding || isLoading) {
    return <LoadingSpinner />;
  }

  return children;
};

export default StartupOnboardingGuard;
