import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import PatternLibraryPage from './pages/PatternLibraryPage';
import ResourcesPage from './pages/ResourcesPage';
import LoginPage from './pages/LoginPage';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-cream)' }}>
        <div className="text-center animate-fade-in">
          <div className="text-5xl mb-3 animate-float">📒</div>
          <p className="text-text-muted text-sm" style={{ fontFamily: 'var(--font-serif)', letterSpacing: '1px' }}>Loading your diary...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/patterns" element={<PatternLibraryPage />} />
                <Route path="/resources" element={<ResourcesPage />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
