/**
 * Student Dashboard Script
 */

let currentUser = null;
let selectedTeacherId = null;

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
    
    if (!userData || userData.role !== 'student') {
        logger.error('Unauthorized access to student dashboard', { uid: user?.uid, role: userData?.role });
        window.location.href = 'index.html';
        return;
    }

    currentUser = userData;
    document.getElementById('studentName').textContent = userData.displayName || userData.email;
    
    logger.info('Student logged in', { uid: user.uid, email: userData.email });

    // Load initial dashboard
    loadDashboard();
    attachEventListeners();
});

async function loadDashboard() {
    const result = await studentModule.getAppointments(authService.getCurrentUser().uid, 'all');
    
    if (result.success) {
        const appointments = result.data;
        
        document.getElementById('totalAppts').textContent = appointments.length;
        document.getElementById('pendingAppts').textContent = appointments.filter(a => a.status === 'pending').length;
        document.getElementById('approvedAppts').textContent = appointments.filter(a => a.status === 'approved').length;
        document.getElementById('completedAppts').textContent = appointments.filter(a => a.status === 'completed').length;
    }
}

async function loadAppointments() {
    const result = await studentModule.getAppointments(authService.getCurrentUser().uid, 'all');
    
    if (result.success) {
        const container = document.getElementById('appointmentsList');
        container.innerHTML = '';
        
        if (result.data.length === 0) {
            container.innerHTML = '<p>No appointments booked yet. <a href="#" onclick="loadSection(\'search\')">Search teachers</a> to book one.</p>';
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
                ${appointment.status === 'pending' ? `
                    <div class="appointment-actions">
                        <button class="btn btn-danger btn-small" onclick="cancelStudentAppointment('${appointment.id}')">Cancel</button>
                    </div>
                ` : ''}
            `;
            container.appendChild(card);
        });
    }
}

async function searchTeachers(filters = {}) {
    const result = await studentModule.searchTeachers(filters);
    
    if (result.success) {
        const container = document.getElementById('searchResults');
        container.innerHTML = '';
        
        if (result.data.length === 0) {
            container.innerHTML = '<p>No teachers found matching your criteria</p>';
            return;
        }

        result.data.forEach(teacher => {
            const card = document.createElement('div');
            card.className = 'list-item';
            card.innerHTML = `
                <h4>${teacher.displayName}</h4>
                <p><strong>Department:</strong> ${teacher.department}</p>
                <p><strong>Subject:</strong> ${teacher.subject}</p>
                <p><strong>Email:</strong> ${teacher.email}</p>
                <div class="appointment-actions">
                    <button class="btn btn-primary btn-small" onclick="openBookAppointmentModal('${teacher.id}', '${teacher.displayName}')">Book Appointment</button>
                </div>
            `;
            container.appendChild(card);
        });
    } else {
        alert('Error searching teachers: ' + result.error);
    }
}

function loadSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });

    document.getElementById(sectionId).style.display = 'block';

    if (sectionId === 'appointments') {
        loadAppointments();
    } else if (sectionId === 'profile') {
        loadProfile();
    }
}

async function loadProfile() {
    const profileData = currentUser;
    document.getElementById('profileName').value = profileData.displayName || '';
    document.getElementById('profileEmail').value = profileData.email;
    document.getElementById('profilePhone').value = profileData.phone || '';
}

function attachEventListeners() {
    const searchForm = document.getElementById('searchForm');
    const bookAppointmentForm = document.getElementById('bookAppointmentForm');
    const profileForm = document.getElementById('profileForm');

    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const filters = {
                name: document.getElementById('searchName').value,
                department: document.getElementById('searchDept').value,
                subject: document.getElementById('searchSubject').value
            };

            searchTeachers(filters);
        });
    }

    if (bookAppointmentForm) {
        bookAppointmentForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const appointmentData = {
                date: document.getElementById('appointmentDate').value,
                time: document.getElementById('appointmentTime').value,
                purpose: document.getElementById('appointmentPurpose').value
            };

            const result = await studentModule.bookAppointment(
                authService.getCurrentUser().uid,
                selectedTeacherId,
                appointmentData
            );

            if (result.success) {
                alert('Appointment booked successfully! The teacher will review your request.');
                closeModal();
                bookAppointmentForm.reset();
            } else {
                alert('Error booking appointment: ' + result.error);
            }
        });
    }

    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const updateData = {
                displayName: document.getElementById('profileName').value,
                phone: document.getElementById('profilePhone').value
            };

            const result = await studentModule.updateProfile(authService.getCurrentUser().uid, updateData);

            if (result.success) {
                alert('Profile updated successfully');
                currentUser = { ...currentUser, ...updateData };
            } else {
                alert('Error updating profile: ' + result.error);
            }
        });
    }
}

function openBookAppointmentModal(teacherId, teacherName) {
    selectedTeacherId = teacherId;
    const modal = document.getElementById('bookAppointmentModal');
    modal.style.display = 'block';
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').min = today;
}

function closeModal() {
    const modal = document.getElementById('bookAppointmentModal');
    modal.style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('bookAppointmentModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

async function cancelStudentAppointment(appointmentId) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    const result = await studentModule.cancelAppointment(appointmentId);
    
    if (result.success) {
        alert('Appointment cancelled');
        loadAppointments();
    } else {
        alert('Error: ' + result.error);
    }
}

async function logout() {
    const result = await authService.logout();
    
    if (result.success) {
        logger.info('Student logged out');
        window.location.href = 'login.html';
    }
}
