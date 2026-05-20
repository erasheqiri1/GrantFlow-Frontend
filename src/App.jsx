import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Applicant pages
import GrantsPage from './pages/applicant/GrantsPage'
import GrantDetailPage from './pages/applicant/GrantDetailPage'
import ApplyPage from './pages/applicant/ApplyPage'
import MyApplicationsPage from './pages/applicant/MyApplicationsPage'

// Org Admin pages
import OrgDashboard from './pages/org-admin/OrgDashboard'
import GrantsManagePage from './pages/org-admin/GrantsManagePage'
import GrantFormPage from './pages/org-admin/GrantFormPage'
import ApplicationsReviewPage from './pages/org-admin/ApplicationsReviewPage'

// Commissioner pages
import CommissionerDashboard from './pages/commissioner/CommissionerDashboard'

// Super Admin pages
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard'

// Layout
import ProtectedRoute from './components/layout/ProtectedRoute'

function RoleRedirect() {
  const { user } = useAuthStore()
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
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/"         element={<RoleRedirect />} />

        {/* Applicant */}
        <Route path="/grants"                element={<ProtectedRoute role="APPLICANT"><GrantsPage /></ProtectedRoute>} />
        <Route path="/grants/:id"            element={<ProtectedRoute role="APPLICANT"><GrantDetailPage /></ProtectedRoute>} />
        <Route path="/grants/:id/apply"      element={<ProtectedRoute role="APPLICANT"><ApplyPage /></ProtectedRoute>} />
        <Route path="/my-applications"       element={<ProtectedRoute role="APPLICANT"><MyApplicationsPage /></ProtectedRoute>} />

        {/* Org Admin */}
        <Route path="/org-admin"                    element={<ProtectedRoute role="ORG_ADMIN"><OrgDashboard /></ProtectedRoute>} />
        <Route path="/org-admin/grants"             element={<ProtectedRoute role="ORG_ADMIN"><GrantsManagePage /></ProtectedRoute>} />
        <Route path="/org-admin/grants/new"         element={<ProtectedRoute role="ORG_ADMIN"><GrantFormPage /></ProtectedRoute>} />
        <Route path="/org-admin/grants/:id/edit"    element={<ProtectedRoute role="ORG_ADMIN"><GrantFormPage /></ProtectedRoute>} />
        <Route path="/org-admin/applications"       element={<ProtectedRoute role="ORG_ADMIN"><ApplicationsReviewPage /></ProtectedRoute>} />

        {/* Commissioner */}
        <Route path="/commissioner" element={<ProtectedRoute role="COMMISSIONER"><CommissionerDashboard /></ProtectedRoute>} />

        {/* Super Admin */}
        <Route path="/super-admin" element={<ProtectedRoute role="SUPER_ADMIN"><SuperAdminDashboard /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
