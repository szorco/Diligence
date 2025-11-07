import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import FigmaDesign from './components/FigmaDesign';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import DevTools from './components/DevTools';

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
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        {currentView === 'landing' ? (
          <FigmaDesign onGetStarted={handleGetStarted} />
        ) : (
          <ProtectedRoute onBackToLanding={handleBackToLanding}>
            <Dashboard onBackToLanding={handleBackToLanding} />
          </ProtectedRoute>
        )}
        
        {/* Development Tools - Always visible in development */}
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          maxWidth: '350px'
        }}>
          <DevTools />
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;