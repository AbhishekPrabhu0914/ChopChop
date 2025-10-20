/**
 * Authentication service for ChopChop
 * Handles authentication with Amazon Cognito
 */

import { CognitoUser, CognitoUserPool, CognitoUserAttribute, AuthenticationDetails, CognitoUserSession } from 'amazon-cognito-identity-js';

export interface AuthUser {
  email: string;
  sessionId: string;
  username?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  session_id?: string;
  email?: string;
  error?: string;
}

// Initialize Cognito User Pool
const userPool = new CognitoUserPool({
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
});

// Generate SECRET_HASH for Cognito authentication
const generateSecretHash = async (username: string): Promise<string> => {
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '';
  const clientSecret = process.env.NEXT_PUBLIC_COGNITO_CLIENT_SECRET || '';
  
  if (!clientSecret) {
    console.warn('COGNITO_CLIENT_SECRET not found in environment variables');
    return '';
  }
  
  const message = username + clientId;
  
  // Use Web Crypto API for HMAC-SHA256
  const encoder = new TextEncoder();
  const keyData = encoder.encode(clientSecret);
  const messageData = encoder.encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const secretHash = btoa(String.fromCharCode(...new Uint8Array(signature)));
  console.log('Generated SECRET_HASH:', secretHash);
  
  return secretHash;
};

// Helper function to create CognitoUser with client secret
const createCognitoUser = (username: string) => {
  const userData: any = {
    Username: username,
    Pool: userPool,
  };
  
  // If client secret is configured, add it to the user data
  const clientSecret = process.env.NEXT_PUBLIC_COGNITO_CLIENT_SECRET;
  if (clientSecret) {
    userData.ClientSecret = clientSecret;
  }
  
  return new CognitoUser(userData);
};

class AuthService {
  private sessionId: string | null = null;
  private user: AuthUser | null = null;

  constructor() {
    // Load session from localStorage on initialization
    this.loadSession();
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      return new Promise(async (resolve) => {
        // Generate SECRET_HASH if client secret is configured
        const secretHash = await generateSecretHash(email);
        
        const cognitoUser = createCognitoUser(email);
        
        const authenticationDetails = new AuthenticationDetails({
          Username: email,
          Password: password,
        });

        // Add SECRET_HASH to authentication details if available
        if (secretHash) {
          (authenticationDetails as any).validationData = [
            {
              Name: 'SECRET_HASH',
              Value: secretHash,
            },
          ];
          console.log('Added SECRET_HASH to authentication details');
        } else {
          console.log('No SECRET_HASH to add');
        }

        cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: (result) => {
            const accessToken = result.getAccessToken().getJwtToken();
            const idToken = result.getIdToken().getJwtToken();
            
            this.sessionId = accessToken;
            this.user = {
              email: email,
              sessionId: accessToken,
              username: email,
            };
            this.saveSession();
            
            resolve({
              success: true,
              message: 'Signed in successfully',
              email: email,
              session_id: accessToken,
            });
          },
          onFailure: (err) => {
            resolve({
              success: false,
              message: err.message || 'Invalid email or password',
              error: err.message || 'Authentication failed',
            });
          },
          newPasswordRequired: (userAttributes, requiredAttributes) => {
            // Handle new password requirement if needed
            resolve({
              success: false,
              message: 'New password required. Please contact support.',
              error: 'New password required',
            });
          },
        });
      });
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        message: 'Network error during sign in',
        error: 'Network error',
      };
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string): Promise<AuthResponse> {
    try {
      return new Promise(async (resolve) => {
        const attributes = [
          new CognitoUserAttribute({ Name: 'email', Value: email }),
        ];

        // Generate SECRET_HASH if client secret is configured
        const secretHash = await generateSecretHash(email);
        const validationData: any[] = [];
        
        if (secretHash) {
          validationData.push({
            Name: 'SECRET_HASH',
            Value: secretHash,
          });
        }

        userPool.signUp(email, password, attributes, validationData, (err, result) => {
          if (err) {
            resolve({
              success: false,
              message: err.message || 'Failed to create account',
              error: err.message || 'Sign up failed',
            });
            return;
          }

          if (result) {
            resolve({
              success: true,
              message: 'Account created successfully. Please check your email for verification.',
              email: email,
            });
          } else {
            resolve({
              success: false,
              message: 'Failed to create account',
              error: 'Unknown error',
            });
          }
        });
      });
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        message: 'Network error during sign up',
        error: 'Network error',
      };
    }
  }

  /**
   * Verify current session
   */
  async verifySession(): Promise<AuthResponse> {
    try {
      const cognitoUser = userPool.getCurrentUser();
      
      if (!cognitoUser) {
        return {
          success: false,
          message: 'No active session',
          error: 'No session',
        };
      }

      return new Promise((resolve) => {
        cognitoUser.getSession((err: any, session: any) => {
          if (err) {
            this.clearSession();
            resolve({
              success: false,
              message: 'Session expired',
              error: 'Session expired',
            });
            return;
          }

          if (session.isValid()) {
            const accessToken = session.getAccessToken().getJwtToken();
            const idToken = session.getIdToken().getJwtToken();
            
            this.sessionId = accessToken;
            this.user = {
              email: idToken.payload.email,
              sessionId: accessToken,
              username: idToken.payload['cognito:username'],
            };
            this.saveSession();
            
            resolve({
              success: true,
              message: 'Session is valid',
              email: idToken.payload.email,
              session_id: accessToken,
            });
          } else {
            this.clearSession();
            resolve({
              success: false,
              message: 'Session expired',
              error: 'Session expired',
            });
          }
        });
      });
    } catch (error) {
      console.error('Session verification error:', error);
      return {
        success: false,
        message: 'Network error during verification',
        error: 'Network error',
      };
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    try {
      const cognitoUser = userPool.getCurrentUser();
      if (cognitoUser) {
        cognitoUser.signOut();
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }

    this.sessionId = null;
    this.user = null;
    this.clearSession();
  }

  /**
   * Get current user
   */
  getCurrentUser(): AuthUser | null {
    return this.user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.user !== null && this.sessionId !== null;
  }

  /**
   * Get session ID for API calls
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Save session to localStorage
   */
  private saveSession(): void {
    if (typeof window !== 'undefined' && this.user && this.sessionId) {
      localStorage.setItem('chopchop_session', JSON.stringify({
        sessionId: this.sessionId,
        user: this.user,
      }));
    }
  }

  /**
   * Load session from localStorage
   */
  private loadSession(): void {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('chopchop_session');
        if (saved) {
          const { sessionId, user } = JSON.parse(saved);
          this.sessionId = sessionId;
          this.user = user;
        }
      } catch (error) {
        console.error('Error loading session:', error);
        this.clearSession();
      }
    }
  }

  /**
   * Clear session from localStorage
   */
  private clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chopchop_session');
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

