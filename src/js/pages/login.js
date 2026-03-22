/**
 * Login Page Script
 */

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        hideMessages();

        try {
            const result = await authService.login(email, password);
            
            if (result.success) {
                showSuccess('Login successful! Redirecting...');
                
                setTimeout(() => {
                    // Redirect based on user role
                    const role = result.userData.role;
                    if (role === 'admin') {
                        window.location.href = 'admin-dashboard.html';
                    } else if (role === 'teacher') {
                        window.location.href = 'teacher-dashboard.html';
                    } else if (role === 'student') {
                        window.location.href = 'student-dashboard.html';
                    }
                }, 1500);
            } else {
                showError(result.error);
            }
        } catch (error) {
            logger.error('Login error', error);
            showError('An error occurred during login');
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
        logger.warn('User already logged in', { uid: authService.getCurrentUser().uid });
        window.location.href = 'index.html';
    }
});
