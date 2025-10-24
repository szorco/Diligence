import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';
import Signup from './Signup';

export default function ProtectedRoute({ children, onBackToLanding }) {
  const { isAuthenticated, isLoading, login, signup } = useAuth();
  const [authMode, setAuthMode] = useState('signup');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return authMode === 'login' ? (
      <Login
        onLogin={async (credentials) => {
          const result = await login(credentials);
          if (!result.success) {
            // Handle login error - you might want to show this in the UI
            console.error('Login failed:', result.error);
          }
        }}
        onSwitchToSignup={() => setAuthMode('signup')}
        onBackToLanding={onBackToLanding}
        isLoading={isLoading}
        error={null} // You can add error state management here
      />
    ) : (
      <Signup
        onSignup={async (userData) => {
          const result = await signup(userData);
          if (!result.success) {
            // Handle signup error - you might want to show this in the UI
            console.error('Signup failed:', result.error);
          }
        }}
        onSwitchToLogin={() => setAuthMode('login')}
        onBackToLanding={onBackToLanding}
        isLoading={isLoading}
        error={null} // You can add error state management here
      />
    );
  }

  return children;
}
