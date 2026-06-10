import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import FDM from './pages/services/FDM'
import SLA from './pages/services/SLA'
import Materials from './pages/Materials'
import Gallery from './pages/Gallery'
import FAQ from './pages/FAQ'
import Contact from './pages/Contact'
import Quote from './pages/Quote'
import Privacy from './pages/Privacy'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminInquiries from './pages/admin/Inquiries'
import InquiryDetail from './pages/admin/InquiryDetail'
import AdminAnalytics from './pages/admin/Analytics'
import AdminModules from './pages/admin/Modules'

function AdminRoute({ children, requiredRole = null }) {
  return (
    <ProtectedRoute requiredRole={requiredRole}>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          {/* 公開頁面 — 使用 MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/fdm" element={<FDM />} />
            <Route path="/services/sla" element={<SLA />} />
            <Route path="/materials" element={<Materials />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/quote" element={<Quote />} />
            <Route path="/privacy" element={<Privacy />} />
          </Route>

          {/* 管理後台 — 不使用 MainLayout */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute requiredRole="admin"><AdminUsers /></AdminRoute>} />
          <Route path="/admin/inquiries" element={<AdminRoute><AdminInquiries /></AdminRoute>} />
          <Route path="/admin/inquiries/:id" element={<AdminRoute><InquiryDetail /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
          <Route path="/admin/modules" element={<AdminRoute><AdminModules /></AdminRoute>} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  )
}
