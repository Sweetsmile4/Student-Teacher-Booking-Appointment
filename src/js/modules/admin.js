/**
 * Admin Module
 * Handles admin functions: add/update/delete teachers, approve student registrations
 */

class AdminModule {
  constructor() {
    this.dbRef = db.collection('teachers');
    this.usersRef = db.collection('users');
  }

  /**
   * Add a new teacher
   * @param {object} teacherData - { name, email, department, subject, phone }
   */
  async addTeacher(teacherData) {
    try {
      logger.info('Adding new teacher', { email: teacherData.email });

      const docRef = await this.dbRef.add({
        name: teacherData.name,
        email: teacherData.email,
        department: teacherData.department,
        subject: teacherData.subject,
        phone: teacherData.phone,
        availability: teacherData.availability || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      });

      logger.info('Teacher added successfully', { teacherId: docRef.id });
      return { success: true, teacherId: docRef.id };
    } catch (error) {
      logger.error('Failed to add teacher', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update teacher information
   * @param {string} teacherId
   * @param {object} updateData
   */
  async updateTeacher(teacherId, updateData) {
    try {
      logger.info('Updating teacher', { teacherId });

      await this.dbRef.doc(teacherId).update({
        ...updateData,
        updatedAt: new Date()
      });

      logger.info('Teacher updated successfully', { teacherId });
      return { success: true };
    } catch (error) {
      logger.error('Failed to update teacher', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a teacher
   * @param {string} teacherId
   */
  async deleteTeacher(teacherId) {
    try {
      logger.info('Deleting teacher', { teacherId });

      await this.dbRef.doc(teacherId).delete();

      logger.info('Teacher deleted successfully', { teacherId });
      return { success: true };
    } catch (error) {
      logger.error('Failed to delete teacher', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all teachers
   */
  async getAllTeachers() {
    try {
      const snapshot = await this.dbRef.where('isActive', '==', true).get();
      const teachers = [];
      snapshot.forEach(doc => {
        teachers.push({ id: doc.id, ...doc.data() });
      });
      logger.info('Fetched all teachers', { count: teachers.length });
      return { success: true, data: teachers };
    } catch (error) {
      logger.error('Failed to fetch teachers', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get pending student registrations
   */
  async getPendingStudents() {
    try {
      const snapshot = await this.usersRef
        .where('role', '==', 'student')
        .where('approved', '==', false)
        .get();
      
      const students = [];
      snapshot.forEach(doc => {
        students.push({ id: doc.id, ...doc.data() });
      });
      
      logger.info('Fetched pending students', { count: students.length });
      return { success: true, data: students };
    } catch (error) {
      logger.error('Failed to fetch pending students', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Approve a student registration
   * @param {string} studentId
   */
  async approveStudent(studentId) {
    try {
      logger.info('Approving student registration', { studentId });

      await this.usersRef.doc(studentId).update({
        approved: true,
        approvedAt: new Date(),
        approvedBy: authService.getCurrentUser().uid
      });

      logger.info('Student approved successfully', { studentId });
      return { success: true };
    } catch (error) {
      logger.error('Failed to approve student', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reject a student registration
   * @param {string} studentId
   * @param {string} reason
   */
  async rejectStudent(studentId, reason = '') {
    try {
      logger.info('Rejecting student registration', { studentId, reason });

      await this.usersRef.doc(studentId).update({
        approved: false,
        rejectedAt: new Date(),
        rejectionReason: reason,
        rejectedBy: authService.getCurrentUser().uid
      });

      logger.info('Student rejected', { studentId });
      return { success: true };
    } catch (error) {
      logger.error('Failed to reject student', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all users (students and teachers)
   */
  async getAllUsers() {
    try {
      const snapshot = await this.usersRef.get();
      const users = [];
      snapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });
      logger.info('Fetched all users', { count: users.length });
      return { success: true, data: users };
    } catch (error) {
      logger.error('Failed to fetch users', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    try {
      const usersSnap = await this.usersRef.get();
      const teachersSnap = await this.dbRef.get();
      const appointmentsSnap = await db.collection('appointments').get();

      const stats = {
        totalUsers: usersSnap.size,
        totalTeachers: teachersSnap.size,
        totalAppointments: appointmentsSnap.size,
        pendingApprovals: 0
      };

      // Count pending approvals
      const pendingSnap = await this.usersRef.where('approved', '==', false).get();
      stats.pendingApprovals = pendingSnap.size;

      logger.info('Dashboard stats retrieved', stats);
      return { success: true, data: stats };
    } catch (error) {
      logger.error('Failed to get dashboard stats', error);
      return { success: false, error: error.message };
    }
  }
}

const adminModule = new AdminModule();
