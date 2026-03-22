/**
 * Student Module
 * Handles student functions: search teachers, book appointments, send messages
 */

class StudentModule {
  constructor() {
    this.appointmentsRef = db.collection('appointments');
    this.messagesRef = db.collection('messages');
    this.usersRef = db.collection('users');
  }

  /**
   * Search for teachers
   * @param {object} filters - { department, subject, name }
   */
  async searchTeachers(filters = {}) {
    try {
      logger.info('Searching teachers', filters);

      let query = this.usersRef.where('role', '==', 'teacher').where('approved', '==', true);

      if (filters.department) {
        query = query.where('department', '==', filters.department);
      }
      if (filters.subject) {
        query = query.where('subject', '==', filters.subject);
      }

      const snapshot = await query.get();
      const teachers = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (filters.name === undefined || data.displayName.toLowerCase().includes(filters.name.toLowerCase())) {
          teachers.push({ id: doc.id, ...data });
        }
      });

      logger.info('Teachers found', { count: teachers.length });
      return { success: true, data: teachers };
    } catch (error) {
      logger.error('Failed to search teachers', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get teacher details
   * @param {string} teacherId
   */
  async getTeacherDetails(teacherId) {
    try {
      const doc = await this.usersRef.doc(teacherId).get();
      if (doc.exists) {
        const data = doc.data();
        if (data.role === 'teacher' && data.approved) {
          logger.info('Teacher details retrieved', { teacherId });
          return { success: true, data };
        }
      }
      return { success: false, error: 'Teacher not found' };
    } catch (error) {
      logger.error('Failed to fetch teacher details', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Book an appointment
   * @param {string} studentId
   * @param {string} teacherId
   * @param {object} appointmentData - { date, time, purpose }
   */
  async bookAppointment(studentId, teacherId, appointmentData) {
    try {
      logger.info('Booking appointment', { studentId, teacherId, date: appointmentData.date });

      const docRef = await this.appointmentsRef.add({
        studentId,
        teacherId,
        date: appointmentData.date,
        time: appointmentData.time,
        purpose: appointmentData.purpose,
        status: 'pending', // pending, approved, cancelled, completed
        createdAt: new Date(),
        updatedAt: new Date()
      });

      logger.info('Appointment booked successfully', { appointmentId: docRef.id });
      return { success: true, appointmentId: docRef.id };
    } catch (error) {
      logger.error('Failed to book appointment', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all appointments for a student
   * @param {string} studentId
   * @param {string} status - 'pending', 'approved', 'cancelled', 'completed' or 'all'
   */
  async getAppointments(studentId, status = 'all') {
    try {
      logger.info('Fetching student appointments', { studentId, status });

      let query = this.appointmentsRef.where('studentId', '==', studentId);
      
      if (status !== 'all') {
        query = query.where('status', '==', status);
      }

      const snapshot = await query.get();
      const appointments = [];
      snapshot.forEach(doc => {
        appointments.push({ id: doc.id, ...doc.data() });
      });

      logger.info('Student appointments fetched', { count: appointments.length });
      return { success: true, data: appointments };
    } catch (error) {
      logger.error('Failed to fetch appointments', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel an appointment
   * @param {string} appointmentId
   */
  async cancelAppointment(appointmentId) {
    try {
      logger.info('Cancelling appointment', { appointmentId });

      await this.appointmentsRef.doc(appointmentId).update({
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: authService.getCurrentUser().uid
      });

      logger.info('Appointment cancelled', { appointmentId });
      return { success: true };
    } catch (error) {
      logger.error('Failed to cancel appointment', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send a message to a teacher
   * @param {string} studentId
   * @param {string} teacherId
   * @param {string} message
   * @param {string} appointmentId - Optional
   */
  async sendMessage(studentId, teacherId, message, appointmentId = null) {
    try {
      logger.info('Sending message to teacher', { teacherId });

      const docRef = await this.messagesRef.add({
        senderId: studentId,
        senderRole: 'student',
        teacherId,
        appointmentId,
        message,
        read: false,
        createdAt: new Date()
      });

      logger.info('Message sent successfully', { messageId: docRef.id });
      return { success: true, messageId: docRef.id };
    } catch (error) {
      logger.error('Failed to send message', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get student profile
   * @param {string} studentId
   */
  async getProfile(studentId) {
    try {
      const doc = await this.usersRef.doc(studentId).get();
      if (doc.exists) {
        logger.info('Student profile retrieved', { studentId });
        return { success: true, data: doc.data() };
      }
      return { success: false, error: 'Student not found' };
    } catch (error) {
      logger.error('Failed to fetch student profile', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update student profile
   * @param {string} studentId
   * @param {object} updateData
   */
  async updateProfile(studentId, updateData) {
    try {
      logger.info('Updating student profile', { studentId });

      await this.usersRef.doc(studentId).update({
        ...updateData,
        updatedAt: new Date()
      });

      logger.info('Student profile updated', { studentId });
      return { success: true };
    } catch (error) {
      logger.error('Failed to update profile', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all appointments for a specific teacher with their details
   * @param {string} teacherId
   */
  async getTeacherAppointmentsWithDetails(teacherId) {
    try {
      const result = await this.searchTeachers({ teacherId });
      if (result.success) {
        return result;
      }
      return { success: false, error: 'Teacher not found' };
    } catch (error) {
      logger.error('Failed to fetch teacher appointments', error);
      return { success: false, error: error.message };
    }
  }
}

const studentModule = new StudentModule();
