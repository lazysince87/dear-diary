import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useApp } from './context/AppContext';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import PatternLibraryPage from './pages/PatternLibraryPage';
import ResourcesPage from './pages/ResourcesPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import SpotifyCallbackPage from './pages/SpotifyCallbackPage';
import ProfilePage from './pages/ProfilePage';

// Protected route wrapper — redirects to onboarding if not completed
function ProtectedRoute({ children, skipOnboardingCheck = false, redirectIfOnboarded = false }) {
  const { user, loading } = useAuth();
  const { preferences, preferencesLoaded } = useApp();

  if (loading || !preferencesLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-cream)' }}>
        <div className="text-center animate-fade-in">
          <p className="text-text-muted text-sm" style={{ fontFamily: 'var(--font-serif)', letterSpacing: '1px' }}>Loading your diary...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user already completed onboarding, redirect away from the onboarding page
  if (redirectIfOnboarded && preferences?.onboardingComplete) {
    return <Navigate to="/" replace />;
  }

  // Auto-redirect to onboarding if not completed (skip for onboarding/callback routes)
  if (!skipOnboardingCheck && (!preferences || !preferences.onboardingComplete)) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding" element={
        <ProtectedRoute skipOnboardingCheck={true} redirectIfOnboarded={true}>
          <OnboardingPage />
        </ProtectedRoute>
      } />
      <Route path="/spotify/callback" element={
        <ProtectedRoute skipOnboardingCheck={true}>
          <SpotifyCallbackPage />
        </ProtectedRoute>
      } />

      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<HomePage />} />
        <Route path="/patterns" element={<PatternLibraryPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;


