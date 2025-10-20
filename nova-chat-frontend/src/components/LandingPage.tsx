'use client';

import React, { useState, useEffect } from 'react';
import { authService } from '../lib/auth';
import AuthModal from './AuthModal';

interface LandingPageProps {
  onEnterApp: (email: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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

  const handleGetStarted = () => {
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (email: string) => {
    setIsAuthModalOpen(false);
    onEnterApp(email);
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
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 25%, #4f46e5 50%, #7c3aed 75%, #ec4899 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        opacity: 0.3,
      }} />
      
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minHeight: '100vh',
        padding: '2rem',
      }}>
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          maxWidth: '800px',
          marginBottom: '4rem',
          marginTop: '2rem',
        }}>
          <div style={{ 
            width: '96px',
            height: '96px',
            margin: '0 auto 1.5rem auto',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
          }}>
            <img src="/favicon.ico" alt="ChopChop" style={{ width: '100%', height: '100%' }} />
          </div>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '800',
            background: 'linear-gradient(45deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1.5rem',
            lineHeight: '1.1',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}>
            ChopChop
          </h1>
          <p style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
            color: 'rgba(248, 250, 252, 0.95)',
            marginBottom: '2.5rem',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 2.5rem auto',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
          }}>
            Transform your kitchen with AI-powered recipe generation, smart grocery management, 
            and intelligent fridge photo analysis. Cook smarter, waste less, enjoy more.
          </p>
          
          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '3rem',
          }}>
            <button
              onClick={handleGetStarted}
              style={{
                padding: '1rem 2rem',
                border: 'none',
                borderRadius: '50px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #ec4899 100%)',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.4)';
              }}
            >
              🚀 Get Started Free
            </button>
            <button
              style={{
                padding: '1rem 2rem',
                border: '2px solid rgba(248, 250, 252, 0.4)',
                borderRadius: '50px',
                backgroundColor: 'rgba(248, 250, 252, 0.1)',
                color: '#f8fafc',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(248, 250, 252, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(248, 250, 252, 0.6)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(248, 250, 252, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(248, 250, 252, 0.4)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              📖 Learn More
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div style={{
          width: '100%',
          maxWidth: '1200px',
          marginBottom: '4rem',
        }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: '700',
            background: 'linear-gradient(45deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '3rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}>
            Why Choose ChopChop?
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
              padding: '2.5rem',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)';
            }}>
              <div style={{ 
                fontSize: '3rem', 
                marginBottom: '1.5rem',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              }}>📸</div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#1e293b', 
                marginBottom: '1rem' 
              }}>
                Smart Fridge Analysis
              </h3>
              <p style={{ 
                color: '#475569', 
                fontSize: '1rem',
                lineHeight: '1.6',
              }}>
                Take a photo of your fridge and get personalized recipe suggestions based on what you actually have. 
                Reduce food waste and discover new dishes instantly.
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
              padding: '2.5rem',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)';
            }}>
              <div style={{ 
                width: '48px',
                height: '48px',
                margin: '0 auto 1.5rem auto',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              }}>
                <img src="/favicon.ico" alt="ChopChop" style={{ width: '100%', height: '100%' }} />
              </div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#1e293b', 
                marginBottom: '1rem' 
              }}>
                AI Recipe Generation
              </h3>
              <p style={{ 
                color: '#475569', 
                fontSize: '1rem',
                lineHeight: '1.6',
              }}>
                Generate custom recipes based on your preferences, dietary restrictions, 
                and available ingredients. Get step-by-step instructions tailored to your skill level.
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
              padding: '2.5rem',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)';
            }}>
              <div style={{ 
                fontSize: '3rem', 
                marginBottom: '1.5rem',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              }}>📝</div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#1e293b', 
                marginBottom: '1rem' 
              }}>
                Smart Grocery Lists
              </h3>
              <p style={{ 
                color: '#475569', 
                fontSize: '1rem',
                lineHeight: '1.6',
              }}>
                Automatically generate shopping lists from your recipes. Track what you have, 
                what you need, and never run out of essential ingredients again.
              </p>
            </div>
          </div>
        </div>

        {/* Demo Section */}
        <div style={{
          width: '100%',
          maxWidth: '1000px',
          marginBottom: '4rem',
        }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: '700',
            background: 'linear-gradient(45deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '3rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}>
            How It Works
          </h2>
          
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
            padding: '3rem',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem',
              alignItems: 'center',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '4rem', 
                  marginBottom: '1rem',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                }}>📱</div>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: '#1e293b', 
                  marginBottom: '0.5rem' 
                }}>
                  1. Upload Photo
                </h3>
                <p style={{ color: '#475569', fontSize: '0.9rem' }}>
                  Take a photo of your fridge contents
                </p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '4rem', 
                  marginBottom: '1rem',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                }}>🤖</div>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: '#1e293b', 
                  marginBottom: '0.5rem' 
                }}>
                  2. AI Analysis
                </h3>
                <p style={{ color: '#475569', fontSize: '0.9rem' }}>
                  Our AI identifies ingredients and freshness
                </p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '4rem', 
                  marginBottom: '1rem',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                }}>🍽️</div>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: '#1e293b', 
                  marginBottom: '0.5rem' 
                }}>
                  3. Get Recipes
                </h3>
                <p style={{ color: '#475569', fontSize: '0.9rem' }}>
                  Receive personalized recipe suggestions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
          padding: '3rem',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          width: '100%',
          maxWidth: '600px',
          textAlign: 'center',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          marginBottom: '3rem',
        }}>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '1rem',
          }}>
            Ready to Transform Your Kitchen?
          </h2>
          
          <p style={{
            color: '#475569',
            marginBottom: '2rem',
            fontSize: '1.1rem',
            lineHeight: '1.6',
          }}>
            Join thousands of home cooks who are already using ChopChop to reduce food waste, 
            discover new recipes, and cook with confidence.
          </p>

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '1.5rem',
          }}>
            <button
              onClick={handleGetStarted}
              style={{
                padding: '1rem 2rem',
                border: 'none',
                borderRadius: '50px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #ec4899 100%)',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.4)';
              }}
            >
              🚀 Start Cooking Smarter
            </button>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2rem',
            fontSize: '0.9rem',
            color: '#64748b',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>✅</span>
              <span>Free to use</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>✅</span>
              <span>No credit card required</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>✅</span>
              <span>Privacy focused</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          color: 'rgba(248, 250, 252, 0.9)',
          fontSize: '0.9rem',
          maxWidth: '800px',
          marginBottom: '2rem',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
            marginBottom: '1rem',
          }}>
            <span>Powered by Amazon Bedrock</span>
            <span>•</span>
            <span>Built with Next.js & React</span>
            <span>•</span>
            <span>Secured with Supabase</span>
          </div>
          <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
            © 2024 ChopChop. Making cooking smarter, one recipe at a time.
          </p>
        </div>

        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    </div>
  );
};

export default LandingPage;
