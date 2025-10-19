'use client';

import React, { useState, useEffect } from 'react';
import LandingPage from './LandingPage';
import ChatInterface from './ChatInterface';
import { authService } from '../lib/auth';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on app load
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        const user = authService.getCurrentUser();
        if (user) {
          setUserEmail(user.email);
          setIsAuthenticated(true);
        }
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const handleEnterApp = (email: string) => {
    setUserEmail(email);
    setIsAuthenticated(true);
  };

  const handleSignOut = async () => {
    await authService.signOut();
    setUserEmail('');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f9fafb',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>Loading ChopChop...</div>
        <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>Please wait while we initialize the app</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  return <ChatInterface onSignOut={handleSignOut} />;
}
