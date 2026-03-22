/**
 * Teacher Module
 * Handles teacher functions: view appointments, approve/cancel appointments, view messages
 */

class TeacherModule {
  constructor() {
    this.appointmentsRef = db.collection('appointments');
    this.messagesRef = db.collection('messages');
    this.usersRef = db.collection('users');
  }

  /**
   * Set teacher availability/schedule
   * @param {string} teacherId
   * @param {array} slots - Array of available time slots
   */
  async setAvailability(teacherId, slots) {
    try {
      logger.info('Setting teacher availability', { teacherId, slotCount: slots.length });

      await this.usersRef.doc(teacherId).update({
        availability: slots,
        updatedAt: new Date()
      });

      logger.info('Teacher availability set successfully', { teacherId });
      return { success: true };
    } catch (error) {
      logger.error('Failed to set availability', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all appointments for a teacher
   * @param {string} teacherId
   * @param {string} status - 'pending', 'approved', 'cancelled', 'completed' or 'all'
   */
  async getAppointments(teacherId, status = 'all') {
    try {
      logger.info('Fetching teacher appointments', { teacherId, status });

      let query = this.appointmentsRef.where('teacherId', '==', teacherId);
      
      if (status !== 'all') {
        query = query.where('status', '==', status);
      }

      const snapshot = await query.get();
      const appointments = [];
      snapshot.forEach(doc => {
        appointments.push({ id: doc.id, ...doc.data() });
      });

      logger.info('Appointments fetched', { count: appointments.length });
      return { success: true, data: appointments };
    } catch (error) {
      logger.error('Failed to fetch appointments', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Approve an appointment
   * @param {string} appointmentId
   */
  async approveAppointment(appointmentId) {
    try {
      logger.info('Approving appointment', { appointmentId });

      await this.appointmentsRef.doc(appointmentId).update({
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: authService.getCurrentUser().uid
      });

      logger.info('Appointment approved', { appointmentId });
      return { success: true };
    } catch (error) {
      logger.error('Failed to approve appointment', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel/reject an appointment
   * @param {string} appointmentId
   * @param {string} reason
   */
  async cancelAppointment(appointmentId, reason = '') {
    try {
      logger.info('Cancelling appointment', { appointmentId, reason });

      await this.appointmentsRef.doc(appointmentId).update({
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: authService.getCurrentUser().uid,
        cancellationReason: reason
      });

      logger.info('Appointment cancelled', { appointmentId });
      return { success: true };
    } catch (error) {
      logger.error('Failed to cancel appointment', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all messages for a teacher
   */
  async getMessages(teacherId) {
    try {
      logger.info('Fetching teacher messages', { teacherId });

      const snapshot = await this.messagesRef
        .where('teacherId', '==', teacherId)
        .orderBy('createdAt', 'desc')
        .get();

      const messages = [];
      snapshot.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() });
      });

      logger.info('Messages fetched', { count: messages.length });
      return { success: true, data: messages };
    } catch (error) {
      logger.error('Failed to fetch messages', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark message as read
   * @param {string} messageId
   */
  async markMessageAsRead(messageId) {
    try {
      await this.messagesRef.doc(messageId).update({
        read: true,
        readAt: new Date()
      });

      logger.info('Message marked as read', { messageId });
      return { success: true };
    } catch (error) {
      logger.error('Failed to mark message as read', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get teacher profile
   * @param {string} teacherId
   */
  async getProfile(teacherId) {
    try {
      const doc = await this.usersRef.doc(teacherId).get();
      if (doc.exists) {
        logger.info('Teacher profile retrieved', { teacherId });
        return { success: true, data: doc.data() };
      }
      return { success: false, error: 'Teacher not found' };
    } catch (error) {
      logger.error('Failed to fetch teacher profile', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update teacher profile
   * @param {string} teacherId
   * @param {object} updateData
   */
  async updateProfile(teacherId, updateData) {
    try {
      logger.info('Updating teacher profile', { teacherId });

      await this.usersRef.doc(teacherId).update({
        ...updateData,
        updatedAt: new Date()
      });

      logger.info('Teacher profile updated', { teacherId });
      return { success: true };
    } catch (error) {
      logger.error('Failed to update profile', error);
      return { success: false, error: error.message };
    }
  }
}

const teacherModule = new TeacherModule();
