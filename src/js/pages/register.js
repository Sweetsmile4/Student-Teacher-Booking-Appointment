/**
 * Register Page Script
 */

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const roleSelect = document.getElementById('role');
    const departmentGroup = document.getElementById('departmentGroup');
    const subjectGroup = document.getElementById('subjectGroup');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    // Show/hide fields based on role selection
    roleSelect.addEventListener('change', function() {
        const role = this.value;
        
        if (role === 'teacher') {
            departmentGroup.style.display = 'block';
            subjectGroup.style.display = 'block';
        } else {
            departmentGroup.style.display = 'none';
            subjectGroup.style.display = 'none';
        }
    });

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        const department = document.getElementById('department').value || '';
        const subject = document.getElementById('subject').value || '';

        hideMessages();

        try {
            const userData = {
                name,
                role,
                department,
                subject
            };

            const result = await authService.register(email, password, userData);

            if (result.success) {
                showSuccess('Registration successful! Redirecting to login...');
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showError(result.error);
            }
        } catch (error) {
            logger.error('Registration error', error);
            showError('An error occurred during registration');
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.className = 'error-message show';
    }

    function showSuccess(message) {
        successMessage.textContent = message;
        successMessage.className = 'success-message show';
    }

    function hideMessages() {
        errorMessage.className = 'error-message';
        successMessage.className = 'success-message';
    }

    // Check if user is already logged in
    if (authService.isAuthenticated()) {
        logger.warn('User already logged in, redirecting to dashboard');
        window.location.href = 'index.html';
    }
});
