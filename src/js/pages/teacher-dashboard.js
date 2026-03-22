/**
 * Teacher Dashboard Script
 */

let currentUser = null;

document.addEventListener('DOMContentLoaded', async function() {
    const user = authService.getCurrentUser();
    
    if (!user) {
        logger.warn('No user authenticated');
        window.location.href = 'login.html';
        return;
    }

    // Wait for auth to fully initialize
    await new Promise(resolve => {
        const checkInterval = setInterval(() => {
            if (authService.currentUser) {
                clearInterval(checkInterval);
                resolve();
            }
        }, 100);
    });

    const userData = await authService.getUserData(user.uid);
    
    if (!userData || userData.role !== 'teacher') {
        logger.error('Unauthorized access to teacher dashboard', { uid: user?.uid, role: userData?.role });
        window.location.href = 'index.html';
        return;
    }

    currentUser = userData;
    document.getElementById('teacherName').textContent = userData.displayName || userData.email;
    
    logger.info('Teacher logged in', { uid: user.uid, email: userData.email });

    // Load initial dashboard
    loadDashboard();
    attachEventListeners();
});

async function loadDashboard() {
    const result = await teacherModule.getAppointments(authService.getCurrentUser().uid, 'all');
    
    if (result.success) {
        const appointments = result.data;
        
        document.getElementById('totalAppts').textContent = appointments.length;
        document.getElementById('pendingAppts').textContent = appointments.filter(a => a.status === 'pending').length;
        document.getElementById('approvedAppts').textContent = appointments.filter(a => a.status === 'approved').length;
    }

    const messagesResult = await teacherModule.getMessages(authService.getCurrentUser().uid);
    if (messagesResult.success) {
        const unreadCount = messagesResult.data.filter(m => !m.read).length;
        document.getElementById('newMessages').textContent = unreadCount;
    }
}

async function loadAppointments() {
    const result = await teacherModule.getAppointments(authService.getCurrentUser().uid, 'all');
    
    if (result.success) {
        const container = document.getElementById('appointmentsList');
        container.innerHTML = '';
        
        if (result.data.length === 0) {
            container.innerHTML = '<p>No appointments</p>';
            return;
        }

        result.data.forEach(appointment => {
            const card = document.createElement('div');
            card.className = 'list-item appointment-item';
            card.innerHTML = `
                <h4>Appointment on ${new Date(appointment.date).toLocaleDateString()}</h4>
                <div class="appointment-details">
                    <p><strong>Time:</strong> ${appointment.time}</p>
                    <p><strong>Purpose:</strong> ${appointment.purpose}</p>
                    <p><strong>Status:</strong> <span class="status-badge status-${appointment.status}">${appointment.status}</span></p>
                </div>
                <div class="appointment-actions">
                    ${appointment.status === 'pending' ? `
                        <button class="btn btn-secondary btn-small" onclick="approveAppointment('${appointment.id}')">Approve</button>
                        <button class="btn btn-danger btn-small" onclick="cancelAppointment('${appointment.id}')">Cancel</button>
                    ` : ''}
                </div>
            `;
            container.appendChild(card);
        });
    }
}

async function loadMessages() {
    const result = await teacherModule.getMessages(authService.getCurrentUser().uid);
    
    if (result.success) {
        const container = document.getElementById('messagesList');
        container.innerHTML = '';
        
        if (result.data.length === 0) {
            container.innerHTML = '<p>No messages</p>';
            return;
        }

        result.data.forEach(message => {
            const card = document.createElement('div');
            card.className = 'list-item';
            card.innerHTML = `
                <h4>Message from Student</h4>
                <p><strong>Date:</strong> ${new Date(message.createdAt.toDate()).toLocaleString()}</p>
                <p>${message.message}</p>
                <p><strong>Status:</strong> ${message.read ? 'Read' : 'Unread'}</p>
            `;
            container.appendChild(card);

            if (!message.read) {
                teacherModule.markMessageAsRead(message.id);
            }
        });
    }
}

function loadSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });

    document.getElementById(sectionId).style.display = 'block';

    if (sectionId === 'appointments') {
        loadAppointments();
    } else if (sectionId === 'messages') {
        loadMessages();
    }
}

async function approveAppointment(appointmentId) {
    const result = await teacherModule.approveAppointment(appointmentId);
    
    if (result.success) {
        alert('Appointment approved');
        loadAppointments();
    } else {
        alert('Error: ' + result.error);
    }
}

async function cancelAppointment(appointmentId) {
    const reason = prompt('Enter cancellation reason:');
    if (reason === null) return;

    const result = await teacherModule.cancelAppointment(appointmentId, reason);
    
    if (result.success) {
        alert('Appointment cancelled');
        loadAppointments();
    } else {
        alert('Error: ' + result.error);
    }
}

function attachEventListeners() {
    const scheduleForm = document.getElementById('scheduleForm');
    
    if (scheduleForm) {
        // Create day checkboxes
        const daysCheckboxes = document.getElementById('daysCheckboxes');
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        
        days.forEach(day => {
            const label = document.createElement('label');
            label.style.display = 'inline-block';
            label.style.marginRight = '1rem';
            label.innerHTML = `<input type="checkbox" name="day" value="${day}"> ${day}`;
            daysCheckboxes.appendChild(label);
        });

        scheduleForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const availability = [];
            // Collect selected days and time slots
            alert('Schedule saved (feature fully coming soon)');
        });
    }
}

function addTimeSlot() {
    const timeSlots = document.getElementById('timeSlots');
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'e.g., 09:00-10:00';
    input.className = 'time-slot';
    timeSlots.appendChild(input);
}

async function logout() {
    const result = await authService.logout();
    
    if (result.success) {
        logger.info('Teacher logged out');
        window.location.href = 'login.html';
    }
}
