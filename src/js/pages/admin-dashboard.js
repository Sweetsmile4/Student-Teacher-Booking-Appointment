/**
 * Admin Dashboard Script
 */

let currentUser = null;

document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is authenticated and is admin
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
    
    if (!userData || userData.role !== 'admin') {
        logger.error('Unauthorized access to admin dashboard', { uid: user?.uid, role: userData?.role });
        window.location.href = 'index.html';
        return;
    }

    currentUser = userData;
    logger.info('Admin logged in', { uid: user.uid, email: userData.email });

    // Load initial dashboard
    loadDashboard();
    attachEventListeners();
});

async function loadDashboard() {
    const result = await adminModule.getDashboardStats();
    
    if (result.success) {
        document.getElementById('totalUsers').textContent = result.data.totalUsers;
        document.getElementById('totalTeachers').textContent = result.data.totalTeachers;
        document.getElementById('totalAppointments').textContent = result.data.totalAppointments;
        document.getElementById('pendingApprovals').textContent = result.data.pendingApprovals;
    }
}

async function loadTeachers() {
    const result = await adminModule.getAllTeachers();
    
    if (result.success) {
        const container = document.getElementById('teachersList');
        container.innerHTML = '';
        
        if (result.data.length === 0) {
            container.innerHTML = '<p>No teachers found</p>';
            return;
        }

        result.data.forEach(teacher => {
            const card = document.createElement('div');
            card.className = 'list-item';
            card.innerHTML = `
                <h4>${teacher.name}</h4>
                <p><strong>Email:</strong> ${teacher.email}</p>
                <p><strong>Department:</strong> ${teacher.department}</p>
                <p><strong>Subject:</strong> ${teacher.subject}</p>
                <p><strong>Phone:</strong> ${teacher.phone}</p>
                <div class="appointment-actions">
                    <button class="btn btn-primary btn-small" onclick="editTeacher('${teacher.id}')">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteTeacher('${teacher.id}')">Delete</button>
                </div>
            `;
            container.appendChild(card);
        });
    }
}

async function loadPendingStudents() {
    const result = await adminModule.getPendingStudents();
    
    if (result.success) {
        const container = document.getElementById('studentsList');
        container.innerHTML = '';
        
        if (result.data.length === 0) {
            container.innerHTML = '<p>No pending student registrations</p>';
            return;
        }

        result.data.forEach(student => {
            const card = document.createElement('div');
            card.className = 'list-item';
            card.innerHTML = `
                <h4>${student.displayName}</h4>
                <p><strong>Email:</strong> ${student.email}</p>
                <p><strong>Registered:</strong> ${new Date(student.createdAt.toDate()).toLocaleDateString()}</p>
                <div class="appointment-actions">
                    <button class="btn btn-secondary btn-small" onclick="approveStudent('${student.id}')">Approve</button>
                    <button class="btn btn-danger btn-small" onclick="rejectStudent('${student.id}')">Reject</button>
                </div>
            `;
            container.appendChild(card);
        });
    }
}

async function loadAllStudents() {
    const allUsersResult = await adminModule.getAllUsers();
    
    if (allUsersResult.success) {
        const students = allUsersResult.data.filter(user => user.role === 'student');
        const container = document.getElementById('allStudentsList');
        container.innerHTML = '';
        
        if (students.length === 0) {
            container.innerHTML = '<p>No students found</p>';
            return;
        }

        students.forEach(student => {
            const status = student.approved ? 'Approved' : 'Pending';
            const statusClass = student.approved ? 'status-approved' : 'status-pending';
            
            const card = document.createElement('div');
            card.className = 'list-item';
            card.innerHTML = `
                <h4>${student.displayName}</h4>
                <p><strong>Email:</strong> ${student.email}</p>
                <p><strong>Status:</strong> <span class="status-badge ${statusClass}">${status}</span></p>
                <p><strong>Registered:</strong> ${new Date(student.createdAt.toDate()).toLocaleDateString()}</p>
            `;
            container.appendChild(card);
        });
    }
}

function loadSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });

    // Show selected section
    document.getElementById(sectionId).style.display = 'block';

    // Load data if needed
    if (sectionId === 'teachers') {
        loadTeachers();
    } else if (sectionId === 'students') {
        loadPendingStudents();
        loadAllStudents();
    }
}

async function approveStudent(studentId) {
    if (!confirm('Are you sure you want to approve this student?')) return;

    const result = await adminModule.approveStudent(studentId);
    
    if (result.success) {
        alert('Student approved successfully');
        loadPendingStudents();
    } else {
        alert('Error approving student: ' + result.error);
    }
}

async function rejectStudent(studentId) {
    const reason = prompt('Enter rejection reason (optional):');
    if (reason === null) return;

    const result = await adminModule.rejectStudent(studentId, reason);
    
    if (result.success) {
        alert('Student rejected');
        loadPendingStudents();
    } else {
        alert('Error rejecting student: ' + result.error);
    }
}

async function deleteTeacher(teacherId) {
    if (!confirm('Are you sure you want to delete this teacher?')) return;

    const result = await adminModule.deleteTeacher(teacherId);
    
    if (result.success) {
        alert('Teacher deleted successfully');
        loadTeachers();
    } else {
        alert('Error deleting teacher: ' + result.error);
    }
}

function editTeacher(teacherId) {
    alert('Edit functionality coming soon');
}

function attachEventListeners() {
    const addTeacherForm = document.getElementById('addTeacherForm');
    
    if (addTeacherForm) {
        addTeacherForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const teacherData = {
                name: document.getElementById('teacherName').value,
                email: document.getElementById('teacherEmail').value,
                department: document.getElementById('teacherDept').value,
                subject: document.getElementById('teacherSubject').value,
                phone: document.getElementById('teacherPhone').value
            };

            const result = await adminModule.addTeacher(teacherData);
            
            if (result.success) {
                alert('Teacher added successfully');
                addTeacherForm.reset();
                loadTeachers();
            } else {
                alert('Error adding teacher: ' + result.error);
            }
        });
    }
}

async function logout() {
    const result = await authService.logout();
    
    if (result.success) {
        logger.info('Admin logged out');
        window.location.href = 'login.html';
    }
}
