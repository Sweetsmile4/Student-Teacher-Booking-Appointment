/**
 * Authentication Service
 * Handles user authentication and session management
 */

class AuthService {
  constructor() {
    this.currentUser = null;
    this.initializeAuthListener();
  }

  /**
   * Initialize Firebase auth state listener
   */
  initializeAuthListener() {
    auth.onAuthStateChanged((user) => {
      this.currentUser = user;
      if (user) {
        logger.info('User authenticated', { uid: user.uid, email: user.email });
        this.storeUserSession(user);
      } else {
        logger.info('User signed out');
        this.clearUserSession();
      }
    });
  }

  /**
   * Register a new user
   * @param {string} email
   * @param {string} password
   * @param {object} userData - Additional user data (name, role, etc)
   */
  async register(email, password, userData) {
    try {
      logger.info('Attempting user registration', { email });
      
      const result = await auth.createUserWithEmailAndPassword(email, password);
      const user = result.user;

      // Store additional user data in Firestore
      await db.collection('users').doc(user.uid).set({
        uid: user.uid,
        email: email,
        displayName: userData.name || '',
        role: userData.role || 'student', // 'student', 'teacher', 'admin'
        department: userData.department || '',
        subject: userData.subject || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        approved: userData.role === 'admin' ? true : false
      });

      logger.info('User registered successfully', { uid: user.uid, email: email, role: userData.role });
      return { success: true, user };
    } catch (error) {
      logger.error('Registration failed', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Login user
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    try {
      logger.info('Attempting user login', { email });
      
      const result = await auth.signInWithEmailAndPassword(email, password);
      const user = result.user;

      // Check if user is approved (for students/teachers)
      const userData = await this.getUserData(user.uid);
      if (!userData.approved && userData.role !== 'admin') {
        logger.warn('User login blocked - not approved', { uid: user.uid });
        await auth.signOut();
        return { 
          success: false, 
          error: 'Your account has not been approved yet. Please wait for admin approval.' 
        };
      }

      logger.info('User logged in successfully', { uid: user.uid, email: email, role: userData.role });
      return { success: true, user, userData };
    } catch (error) {
      logger.error('Login failed', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      logger.info('User logout initiated', { uid: this.currentUser?.uid });
      await auth.signOut();
      this.clearUserSession();
      logger.info('User logged out successfully');
      return { success: true };
    } catch (error) {
      logger.error('Logout failed', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user data from Firestore
   * @param {string} uid
   */
  async getUserData(uid) {
    try {
      const doc = await db.collection('users').doc(uid).get();
      if (doc.exists) {
        return doc.data();
      }
      return null;
    } catch (error) {
      logger.error('Failed to fetch user data', error);
      return null;
    }
  }

  /**
   * Store user session in localStorage
   * @private
   */
  storeUserSession(user) {
    try {
      sessionStorage.setItem('currentUser', JSON.stringify({
        uid: user.uid,
        email: user.email
      }));
    } catch (error) {
      logger.error('Failed to store user session', error);
    }
  }

  /**
   * Clear user session
   * @private
   */
  clearUserSession() {
    try {
      sessionStorage.removeItem('currentUser');
    } catch (error) {
      logger.error('Failed to clear user session', error);
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.currentUser !== null;
  }
}

const authService = new AuthService();
