import { Routes, Route } from 'react-router-dom'
import { StartupLayout } from './layouts'
import { HomePage, AboutPage, ServicesPage, ContactPage, MvpPage, MvpFormPage, SignUpPage } from './pages/startup'
import LoginPage from './pages/startup/LoginPage'
import ForgotPasswordPage from './pages/startup/ForgotPasswordPage'
import ResetPasswordPage from './pages/startup/ResetPasswordPage'
import DirectChatPage from './pages/startup/DirectChatPage'
import { 
  StartupDashboardPage,
  SprintStatusPage, 
  SprintOnboardingStep1, 
  SprintOnboardingStep2, 
  StartupChatPage
} from './pages'
import NewSprintOnboardingStep1 from './pages/startup/NewSprintOnboardingStep1.jsx'
import NewSprintOnboardingStep2 from './pages/startup/NewSprintOnboardingStep2.jsx'
import NewSprintOnboardingStep3 from './pages/startup/NewSprintOnboardingStep3.jsx'
import StartupBoardPage from './pages/startup/StartupBoardPage'
import DashboardLayout from './layouts/DashboardLayout'
import AdminLayout from './layouts/AdminLayout'
import AdminProtectedRoute from './components/layout/AdminProtectedRoute'
import StartupProtectedRoute from './components/layout/StartupProtectedRoute'
import AdminDashboardPage from './pages/admin/DashboardPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import TablePage from './pages/admin/TablePage'
import RequestDetailPage from './pages/admin/RequestDetailPage'
import AdminChatPage from './pages/admin/AdminChatPage'
import BoardPage from './pages/admin/BoardPage'
import AdminSprintListPage from './pages/admin/AdminSprintListPage'
import StartupsPage from './pages/admin/StartupsPage'
import StartupSprintsPage from './pages/admin/StartupSprintsPage'
import StartupOnboardingGuard from './components/layout/StartupOnboardingGuard'
import RequestsPage from './pages/admin/RequestsPage'
import PaymentPendingPage from './pages/startup/PaymentPendingPage'

import ScrollToTop from './components/ScrollToTop';
import useTokenRefresh from './hooks/useTokenRefresh';

function App() {
  useTokenRefresh();
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* HomePage route outside StartupLayout */}
        <Route path="/" element={<HomePage />} />

        {/* Pages without header/footer */}
        <Route path="mvp/form" element={<MvpFormPage />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="startup/login" element={<LoginPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route
          path="sprint/status"
          element={
            <StartupProtectedRoute>
              <SprintStatusPage />
            </StartupProtectedRoute>
          }
        />
        <Route
          path="sprint/:sprintId/onboarding/step-1"
          element={
            <StartupProtectedRoute>
              <SprintOnboardingStep1 />
            </StartupProtectedRoute>
          }
        />
        <Route
          path="sprint/:sprintId/onboarding/step-2"
          element={
            <StartupProtectedRoute>
              <SprintOnboardingStep2 />
            </StartupProtectedRoute>
          }
        />

        <Route path="/" element={<StartupLayout />}>
          {/* Remove index route for HomePage here */}
          <Route path="about" element={<AboutPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="mvp" element={<MvpPage />} />

          {/* NEW SPRINT ONBOARDING ROUTES */}
          <Route
            path="new-sprint/onboarding/:questionnaireId/step1"
            element={
              <StartupProtectedRoute>
                <NewSprintOnboardingStep1 />
              </StartupProtectedRoute>
            }
          />
          <Route
            path="new-sprint/onboarding/:questionnaireId/step2/:sprintId"
            element={
              <StartupProtectedRoute>
                <NewSprintOnboardingStep2 />
              </StartupProtectedRoute>
            }
          />
          <Route
            path="new-sprint/onboarding/:questionnaireId/step3/:sprintId"
            element={
              <StartupProtectedRoute>
                <NewSprintOnboardingStep3 />
              </StartupProtectedRoute>
            }
          />

          {/* Payment Pending Page */}
          <Route
            path="startup/payment-pending"
            element={
              <StartupProtectedRoute>
                <StartupOnboardingGuard>
                  <PaymentPendingPage />
                </StartupOnboardingGuard>
              </StartupProtectedRoute>
            }
          />

        </Route>

        <Route
          path="/startup/sprint/:sprintId/board"
          element={
            <StartupProtectedRoute>
              <StartupOnboardingGuard>
                <DashboardLayout>
                  <StartupBoardPage />
                </DashboardLayout>
              </StartupOnboardingGuard>
            </StartupProtectedRoute>
          }
        />

        {/* Dashboard page with dashboard layout */}
        <Route
          path="/startup/dashboard"
          element={
            <StartupProtectedRoute>
              <StartupOnboardingGuard>
                <DashboardLayout>
                  <StartupDashboardPage />
                </DashboardLayout>
              </StartupOnboardingGuard>
            </StartupProtectedRoute>
          }
        />
        
        <Route
          path="/startup/chat"
          element={
            <StartupProtectedRoute>
              <StartupOnboardingGuard>
                <DashboardLayout>
                  <StartupChatPage />
                </DashboardLayout>
              </StartupOnboardingGuard>
            </StartupProtectedRoute>
          }
        />

        <Route
          path="/startup/chat/:id"
          element={
            <StartupProtectedRoute>
              <StartupOnboardingGuard>
                <DashboardLayout>
                  <StartupChatPage />
                </DashboardLayout>
              </StartupOnboardingGuard>
            </StartupProtectedRoute>
          }
        />

        <Route
          path="/startup/direct-chat"
          element={
            <StartupProtectedRoute>
              <DirectChatPage />
            </StartupProtectedRoute>
          }
        />

        {/* Admin authentication */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        
        {/* Protected Admin routes */}
        <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminLayout><AdminDashboardPage /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/requests" element={<AdminProtectedRoute><AdminLayout><RequestsPage /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/request/:id" element={<AdminProtectedRoute><AdminLayout><RequestDetailPage /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/startups" element={<AdminProtectedRoute><AdminLayout><StartupsPage /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/startups/:startupId/sprints" element={<AdminProtectedRoute><AdminLayout><StartupSprintsPage /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/chat" element={<AdminProtectedRoute><AdminChatPage /></AdminProtectedRoute>} />
        <Route path="/admin/chat/:id" element={<AdminProtectedRoute><AdminChatPage /></AdminProtectedRoute>} />
        <Route path="/admin/sprints" element={<AdminProtectedRoute><AdminSprintListPage /></AdminProtectedRoute>} />
        <Route path="/admin/board/:sprintId" element={<AdminProtectedRoute><BoardPage /></AdminProtectedRoute>} />
      </Routes>
    </>
  )
}

export default App
