/**
 * Ultra-Simple Authentication Service for ChopChop
 * Just asks for email, no verification, no passwords, no localStorage
 */

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

class SimpleAuthService {
  private sessionId: string | null = null;
  private user: AuthUser | null = null;

  constructor() {
    // No localStorage, no session persistence
    // Just start fresh every time
  }

  /**
   * Enter app with just email (no password needed)
   */
  async enterApp(email: string): Promise<AuthResponse> {
    try {
      // Simple validation - just check if email is not empty
      if (!email.trim()) {
        return {
          success: false,
          message: 'Please enter your email address',
          error: 'Email required',
        };
      }

      // Basic email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return {
          success: false,
          message: 'Please enter a valid email address',
          error: 'Invalid email format',
        };
      }

      // Create a simple session ID
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.sessionId = sessionId;
      this.user = {
        email: email.trim(),
        sessionId: sessionId,
        username: email.trim(),
      };

      return {
        success: true,
        message: 'Welcome to ChopChop!',
        email: email.trim(),
        session_id: sessionId,
      };
    } catch (error) {
      console.error('Enter app error:', error);
      return {
        success: false,
        message: 'Failed to enter app',
        error: 'Enter app error',
      };
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    this.sessionId = null;
    this.user = null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.sessionId !== null && this.user !== null;
  }

  /**
   * Get current user
   */
  getCurrentUser(): AuthUser | null {
    return this.user;
  }

  /**
   * Get current session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Verify current session (always returns success if session exists)
   */
  async verifySession(): Promise<AuthResponse> {
    try {
      if (!this.sessionId || !this.user) {
        return {
          success: false,
          message: 'No active session',
          error: 'No session',
        };
      }

      return {
        success: true,
        message: 'Session is valid',
        email: this.user.email,
        session_id: this.sessionId,
      };
    } catch (error) {
      console.error('Session verification error:', error);
      return {
        success: false,
        message: 'Session verification failed',
        error: 'Session error',
      };
    }
  }
}

// Export singleton instance
export const authService = new SimpleAuthService();
export default authService;