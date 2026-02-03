(async function() {
    // Get credentials from URL
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const password = urlParams.get('password');

    if (!email || !password) {
        showError('Credenziali mancanti');
        return;
    }

    try {
        // Make login request directly to Strapi admin API
        const response = await fetch('/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Important: include cookies
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok && data.data) {
            console.log('Login successful');
            
            // Clear old data
            localStorage.clear();
            sessionStorage.clear();
            
            // Save user info in localStorage
            localStorage.setItem('userInfo', JSON.stringify(data.data.user));
            
            // Save JWT token in sessionStorage as JSON string (with quotes)
            sessionStorage.setItem('jwtToken', JSON.stringify(data.data.token));
            
            // Set some default Strapi settings
            localStorage.setItem('STRAPI_NPS_SURVEY_SETTINGS', JSON.stringify({
                "enabled": true,
                "lastResponseDate": null,
                "firstDismissalDate": null,
                "lastDismissalDate": null
            }));
            
            console.log('Auth data saved, redirecting...');
            
            // Redirect to admin panel
            setTimeout(() => {
                window.location.href = '/admin';
            }, 500);
        } else {
            throw new Error(data.error?.message || 'Login fallito');
        }

    } catch (error) {
        console.error('Login error:', error);
        showError('Errore durante il login: ' + error.message);
    }
})();

function showError(message) {
    const content = document.getElementById('content');
    content.classList.add('error');
    content.innerHTML = `
        <h1>⚠️ Errore</h1>
        <p>${message}</p>
        <a href="http://localhost:3000/login">Torna al Login</a>
    `;
}
