// public/js/loginDisplay.js
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const city = document.getElementById('city').value;
    
    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, city })
        });

        const data = await response.json();
        
        if (data.success) {
            // Store user data in sessionStorage
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('city', city);
            window.location.href = data.redirect;
        } else {
            showError(data.error);
        }
    } catch (error) {
        showError('Network error. Please try again.');
    }
});

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}