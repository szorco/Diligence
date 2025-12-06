import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import FigmaDesign from './components/FigmaDesign';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import DevTools from './components/DevTools';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' or 'dashboard'
  const [initialAuthMode, setInitialAuthMode] = useState('signup');

  const handleGetStarted = () => {
    setInitialAuthMode('signup');
    setCurrentView('dashboard');
  };

  const handleSignIn = () => {
    setInitialAuthMode('login');
    setCurrentView('dashboard');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  return (
    <AuthProvider>
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        {currentView === 'landing' ? (
          <FigmaDesign onGetStarted={handleGetStarted} onSignIn={handleSignIn} />
        ) : (
          <ProtectedRoute onBackToLanding={handleBackToLanding} initialAuthMode={initialAuthMode}>
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