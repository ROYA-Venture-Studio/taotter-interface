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
    if (!user || !user.onboarding || isLoading) return;

    const currentPath = window.location.pathname;

    // Check for unpaid sprints with selected packages (only active sprints)
    const unpaidSprint = sprintsData?.data?.sprints?.find(
      (s) =>
        s.status !== "inactive" && // Only check active sprints
        s.selectedPackage &&
        String(s.selectedPackagePaymentStatus).toLowerCase() !== "paid"
    );

    // If any unpaid sprint exists, redirect to payment page (but not if already there)
    if (unpaidSprint) {
      if (currentPath !== "/startup/payment-pending") {
        navigate("/startup/payment-pending", { replace: true });
      }
      return;
    }

    // If we're on payment pending page but no unpaid sprints, go to dashboard
    if (currentPath === "/startup/payment-pending") {
      navigate("/startup/dashboard", { replace: true });
      return;
    }

    // If onboarding is incomplete, redirect only if user is on a restricted page
    const onboardingStep = user.onboarding.currentStep;
    const allowedRoutes = [
      "/startup/dashboard",
      "/startup/sprint",
      "/startup/chat",
      "/startup/board"
    ];
    const isAllowedRoute = allowedRoutes.some(route => currentPath.startsWith(route));

    if (
      ["sprint_selection", "document_upload", "meeting_scheduling"].includes(onboardingStep) &&
      !isAllowedRoute
    ) {
      navigate("/startup/dashboard", { replace: true });
      return;
    }

    // If onboarding is complete and payment is done, allow navigation
    // No redirect needed
  }, [user, navigate, sprintsData, isLoading]);

  // Show loading spinner while fetching sprints or user not loaded
  if (!user || !user.onboarding || isLoading) {
    return <LoadingSpinner />;
  }

  return children;
};

export default StartupOnboardingGuard;
