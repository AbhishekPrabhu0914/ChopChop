/**
 * Authentication service for ChopChop
 * Handles email-based authentication with session management
 */

export interface AuthUser {
  email: string;
  sessionId: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  session_id?: string;
  email?: string;
  error?: string;
}

class AuthService {
  private sessionId: string | null = null;
  private user: AuthUser | null = null;

  constructor() {
    // Load session from localStorage on initialization
    this.loadSession();
  }

  /**
   * Sign in with email
   */
  async signIn(email: string): Promise<AuthResponse> {
    try {
      const response = await fetch('http://localhost:8000/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.session_id && data.email) {
        this.sessionId = data.session_id;
        this.user = {
          email: data.email,
          sessionId: data.session_id,
        };
        this.saveSession();
        return data;
      } else {
        return data;
      }
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
   * Verify current session
   */
  async verifySession(): Promise<AuthResponse> {
    if (!this.sessionId) {
      return {
        success: false,
        message: 'No active session',
        error: 'No session',
      };
    }

    try {
      const response = await fetch('http://localhost:8000/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: this.sessionId }),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.email) {
        this.user = {
          email: data.email,
          sessionId: this.sessionId,
        };
        return data;
      } else {
        // Session is invalid, clear it
        this.signOut();
        return data;
      }
    } catch (error) {
      console.error('Session verification error:', error);
      this.signOut();
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
    if (this.sessionId) {
      try {
        await fetch('http://localhost:8000/auth/signout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ session_id: this.sessionId }),
        });
      } catch (error) {
        console.error('Sign out error:', error);
      }
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

