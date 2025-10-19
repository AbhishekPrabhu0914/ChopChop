'use client';

import React, { useState, useEffect } from 'react';
import { authService } from '../lib/auth';

interface LandingPageProps {
  onEnterApp: (email: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkExistingAuth = async () => {
      if (authService.isAuthenticated()) {
        const user = authService.getCurrentUser();
        if (user) {
          // User is already signed in, enter app directly
          onEnterApp(user.email);
          return;
        }
      }
      setIsCheckingAuth(false);
    };

    checkExistingAuth();
  }, [onEnterApp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authService.signIn(email.trim());
      
      if (response.success) {
        onEnterApp(response.email!);
      } else {
        setError(response.error || response.message || 'Sign in failed');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
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
        <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>Please wait while we check your authentication</div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f9fafb',
      padding: '2rem',
    }}>
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        maxWidth: '600px',
        marginBottom: '3rem',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚀</div>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '1rem',
          lineHeight: '1.2',
        }}>
          Welcome to ChopChop
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: '#6b7280',
          marginBottom: '2rem',
          lineHeight: '1.6',
        }}>
          Your AI-powered kitchen assistant that helps you cook smarter, 
          manage your grocery lists, and discover amazing recipes from your fridge photos.
        </p>
      </div>

      {/* Features */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem',
        width: '100%',
        maxWidth: '800px',
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🤖</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
            AI Chat Assistant
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Ask cooking questions and get instant answers powered by Amazon Bedrock
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📸</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
            Fridge Photo Analysis
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Upload photos of your fridge to get personalized recipes and grocery lists
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📝</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
            Smart Lists
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Automatically manage grocery lists and save your favorite recipes
          </p>
        </div>
      </div>

      {/* Sign In Form */}
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '1rem',
          textAlign: 'center',
        }}>
          Get Started
        </h2>
        
        <p style={{
          color: '#6b7280',
          marginBottom: '1.5rem',
          textAlign: 'center',
          fontSize: '0.875rem',
        }}>
          Enter your email to start using ChopChop
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem',
            }}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                backgroundColor: isLoading ? '#f9fafb' : 'white',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '0.5rem',
              backgroundColor: isLoading || !email.trim() ? '#9ca3af' : '#3b82f6',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: isLoading || !email.trim() ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            {isLoading ? 'Signing In...' : 'Enter ChopChop'}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '3rem',
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: '0.875rem',
      }}>
        <p>Powered by Amazon Bedrock • Built with Next.js & React</p>
      </div>
    </div>
  );
};

export default LandingPage;
