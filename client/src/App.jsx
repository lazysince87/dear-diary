import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import PatternLibraryPage from './pages/PatternLibraryPage';
import ResourcesPage from './pages/ResourcesPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/patterns" element={<PatternLibraryPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
