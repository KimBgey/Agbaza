import { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth, AuthProvider } from './contexts/AuthContext'
import BottomNav from './components/BottomNav'
import Home from './screens/Home'
import Programme from './screens/Programme'
import Seance from './screens/Seance'
import Progres from './screens/Progres'
import Profil from './screens/Profil'
import Login from './screens/auth/Login'
import Register from './screens/auth/Register'
import Onboarding from './screens/auth/Onboarding'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function OnboardingGuard({ children }) {
  const { user, userProfile, loading } = useAuth()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" replace />
  if (!userProfile) return <Navigate to="/onboarding" replace />
  return children
}

function Loader() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: 'var(--ag-bg)'
    }}>
      <img src="/icons/text.png" alt="AGBAZA" style={{ height: 40, width: 'auto' }} />
      <div style={{ marginTop: 24, display: 'flex', gap: 6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--ag-orange)',
            animation: `pulse 1.2s ease ${i * 0.2}s infinite`
          }} />
        ))}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function AppShell() {
  const { user, userProfile } = useAuth()
  const showNav = user && userProfile

  return (
    <div className="app-shell">
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={
          <PrivateRoute><Onboarding /></PrivateRoute>
        } />

        {/* App */}
        <Route path="/" element={
          <OnboardingGuard><Home /></OnboardingGuard>
        } />
        <Route path="/programme" element={
          <OnboardingGuard><Programme /></OnboardingGuard>
        } />
        <Route path="/seance" element={
          <OnboardingGuard><Seance /></OnboardingGuard>
        } />
        <Route path="/progres" element={
          <OnboardingGuard><Progres /></OnboardingGuard>
        } />
        <Route path="/profil" element={
          <OnboardingGuard><Profil /></OnboardingGuard>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showNav && <BottomNav />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Loader />}>
          <AppShell />
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
