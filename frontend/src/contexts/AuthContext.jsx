import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Development user data
const DEV_USER = {
  id: 'dev-user-123',
  email: 'dev@example.com',
  name: 'Development User',
};

const DEV_TOKEN = 'dev-token-12345';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [devMode, setDevMode] = useState(process.env.NODE_ENV === 'development');

  // API base URL is imported from config

  // Check for existing token on app load
  useEffect(() => {
    console.log('AuthProvider initializing. NODE_ENV:', process.env.NODE_ENV);
    
    // In development mode, check if we should auto-login
    if (devMode && process.env.NODE_ENV === 'development') {
      console.log('Development mode detected, auto-logging in as dev user');
      setToken(DEV_TOKEN);
      setUser(DEV_USER);
      localStorage.setItem('diligence_token', DEV_TOKEN);
      localStorage.setItem('diligence_user', JSON.stringify(DEV_USER));
      setIsLoading(false);
      return;
    }
    
    const storedToken = localStorage.getItem('diligence_token');
    const storedUser = localStorage.getItem('diligence_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, [devMode]);

  // Development login function
  const devLogin = async () => {
    if (process.env.NODE_ENV !== 'development') {
      console.log('Dev login only available in development mode');
      return { success: false, error: 'Not in development mode' };
    }
    
    console.log('Dev login initiated');
    setIsLoading(true);
    try {
      setToken(DEV_TOKEN);
      setUser(DEV_USER);
      localStorage.setItem('diligence_token', DEV_TOKEN);
      localStorage.setItem('diligence_user', JSON.stringify(DEV_USER));
      console.log('Dev login successful');
      return { success: true };
    } catch (error) {
      console.error('Dev login error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (credentials) => {
    // In dev mode with dev credentials, use quick login
    if (devMode && process.env.NODE_ENV === 'development' && credentials.email === 'dev@example.com') {
      return devLogin();
    }
    
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      const { access_token } = data;

      // Get user info
      const userResponse = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const userData = await userResponse.json();

      // Store in localStorage
      localStorage.setItem('diligence_token', access_token);
      localStorage.setItem('diligence_user', JSON.stringify(userData));

      setToken(access_token);
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Signup failed');
      }

      // Auto-login after successful signup
      return await login({
        email: userData.email,
        password: userData.password
      });
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('diligence_token');
    localStorage.removeItem('diligence_user');
    setToken(null);
    setUser(null);
  };

  // Get authenticated fetch function
  const authenticatedFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, {
      ...options,
      headers,
    });
  };

  const value = {
    user,
    token,
    isLoading,
    devMode,
    setDevMode,
    login,
    signup,
    logout,
    devLogin,
    authenticatedFetch,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
