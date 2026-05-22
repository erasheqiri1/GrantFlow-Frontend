import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import OrgRegisterPage from './pages/auth/OrgRegisterPage'
import AcceptInvitePage from './pages/auth/AcceptInvitePage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

// Applicant pages
import GrantsPage from './pages/applicant/GrantsPage'
import GrantDetailPage from './pages/applicant/GrantDetailPage'
import ApplyPage from './pages/applicant/ApplyPage'
import MyApplicationsPage from './pages/applicant/MyApplicationsPage'
import ApplicationDetailPage from './pages/applicant/ApplicationDetailPage'
import ProfilePage from './pages/applicant/ProfilePage'

// Org Admin pages
import OrgDashboard from './pages/org-admin/OrgDashboard'
import GrantsManagePage from './pages/org-admin/GrantsManagePage'
import GrantFormPage from './pages/org-admin/GrantFormPage'
import ApplicationsReviewPage from './pages/org-admin/ApplicationsReviewPage'
import TeamPage from './pages/org-admin/TeamPage'

// Commissioner pages
import CommissionerDashboard from './pages/commissioner/CommissionerDashboard'
import CommissionerApplicationsPage from './pages/commissioner/CommissionerApplicationsPage'
import CommissionerProfilePage from './pages/commissioner/CommissionerProfilePage'

// Super Admin pages
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard'
import PendingOrgsPage from './pages/super-admin/PendingOrgsPage'
import UsersListPage from './pages/super-admin/UsersListPage'
import AuditLogsPage from './pages/super-admin/AuditLogsPage'
import AddSuperAdminPage from './pages/super-admin/AddSuperAdminPage'

// Shared pages
import NotificationsPage from './pages/NotificationsPage'

// Layout
import './styles/applicant-fixes.css'
import ProtectedRoute from './components/layout/ProtectedRoute'

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />

  switch (user.role) {
    case 'SUPER_ADMIN':   return <Navigate to="/super-admin" replace />
    case 'ORG_ADMIN':     return <Navigate to="/org-admin" replace />
    case 'COMMISSIONER':  return <Navigate to="/commissioner" replace />
    case 'APPLICANT':     return <Navigate to="/grants" replace />
    default:              return <Navigate to="/login" replace />
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"        element={<LoginPage />} />
        <Route path="/register"     element={<RegisterPage />} />
        <Route path="/register/org"  element={<OrgRegisterPage />} />
        <Route path="/accept-invite"    element={<AcceptInvitePage />} />
        <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
        <Route path="/reset-password"   element={<ResetPasswordPage />} />
        <Route path="/"                 element={<RoleRedirect />} />

        {/* Applicant */}
        <Route path="/grants"                  element={<ProtectedRoute role="APPLICANT"><GrantsPage /></ProtectedRoute>} />
        <Route path="/grants/:id"              element={<ProtectedRoute role="APPLICANT"><GrantDetailPage /></ProtectedRoute>} />
        <Route path="/grants/:id/apply"        element={<ProtectedRoute role="APPLICANT"><ApplyPage /></ProtectedRoute>} />
        <Route path="/my-applications"         element={<ProtectedRoute role="APPLICANT"><MyApplicationsPage /></ProtectedRoute>} />
        <Route path="/my-applications/:id"     element={<ProtectedRoute role="APPLICANT"><ApplicationDetailPage /></ProtectedRoute>} />
        <Route path="/profile"                 element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/notifications"           element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

        {/* Org Admin */}
        <Route path="/org-admin"                    element={<ProtectedRoute role="ORG_ADMIN"><OrgDashboard /></ProtectedRoute>} />
        <Route path="/org-admin/grants"             element={<ProtectedRoute role="ORG_ADMIN"><GrantsManagePage /></ProtectedRoute>} />
        <Route path="/org-admin/grants/new"         element={<ProtectedRoute role="ORG_ADMIN"><GrantFormPage /></ProtectedRoute>} />
        <Route path="/org-admin/grants/:id/edit"    element={<ProtectedRoute role="ORG_ADMIN"><GrantFormPage /></ProtectedRoute>} />
        <Route path="/org-admin/applications"       element={<ProtectedRoute role="ORG_ADMIN"><ApplicationsReviewPage /></ProtectedRoute>} />
        <Route path="/org-admin/team"              element={<ProtectedRoute role="ORG_ADMIN"><TeamPage /></ProtectedRoute>} />

        {/* Commissioner */}
        <Route path="/commissioner"              element={<ProtectedRoute role="COMMISSIONER"><CommissionerDashboard /></ProtectedRoute>} />
        <Route path="/commissioner/applications" element={<ProtectedRoute role="COMMISSIONER"><CommissionerApplicationsPage /></ProtectedRoute>} />
        <Route path="/commissioner/profile"      element={<ProtectedRoute role="COMMISSIONER"><CommissionerProfilePage /></ProtectedRoute>} />

        {/* Super Admin */}
        <Route path="/super-admin"            element={<ProtectedRoute role="SUPER_ADMIN"><SuperAdminDashboard /></ProtectedRoute>} />
        <Route path="/super-admin/pending"    element={<ProtectedRoute role="SUPER_ADMIN"><PendingOrgsPage /></ProtectedRoute>} />
        <Route path="/super-admin/users"      element={<ProtectedRoute role="SUPER_ADMIN"><UsersListPage /></ProtectedRoute>} />
        <Route path="/super-admin/audit"      element={<ProtectedRoute role="SUPER_ADMIN"><AuditLogsPage /></ProtectedRoute>} />
        <Route path="/super-admin/add-admin"  element={<ProtectedRoute role="SUPER_ADMIN"><AddSuperAdminPage /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
