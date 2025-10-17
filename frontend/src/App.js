import React, { useState } from 'react';
import FigmaDesign from './components/FigmaDesign';
import Dashboard from './components/Dashboard';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' or 'dashboard'

  const handleGetStarted = () => {
    setCurrentView('dashboard');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  return (
    <div>
      {currentView === 'landing' ? (
        <FigmaDesign onGetStarted={handleGetStarted} />
      ) : (
        <Dashboard onBackToLanding={handleBackToLanding} />
      )}
    </div>
  );
}

export default App;