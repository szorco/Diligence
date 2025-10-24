import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import FigmaDesign from './components/FigmaDesign';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' or 'dashboard'

  const handleGetStarted = () => {
    setCurrentView('dashboard');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  return (
    <AuthProvider>
      <div>
        {currentView === 'landing' ? (
          <FigmaDesign onGetStarted={handleGetStarted} />
        ) : (
          <ProtectedRoute onBackToLanding={handleBackToLanding}>
            <Dashboard onBackToLanding={handleBackToLanding} />
          </ProtectedRoute>
        )}
      </div>
    </AuthProvider>
  );
}

export default App;