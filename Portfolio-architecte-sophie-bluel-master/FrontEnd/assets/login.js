document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector('#contact form');
    const emailInput = document.querySelector('#email');
    const passwordInput = document.querySelector('#pass');
    const errorMessage = document.createElement('div');
    errorMessage.style.color = 'red';
    errorMessage.style.marginTop = '10px';

    loginForm.appendChild(errorMessage);

    // Fonction pour valider l'email
    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    }

    emailInput.value = 'sophie.bluel@test.tld';
    passwordInput.value = 'S0phie';

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault(); 

        errorMessage.textContent = '';

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !validateEmail(email)) {
            errorMessage.textContent = 'Veuillez entrer une adresse e-mail valide.';
            return;
        }

        if (!password) {
            errorMessage.textContent = 'Veuillez entrer un mot de passe.';
            return;
        }

        loginUser(email, password);
    });

    function loginUser(email, password) {
        fetch('http://localhost:5678/api/users/login', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 404 || response.status === 401) {
                    throw new Error('Email ou mot de passe incorrect.');
                } else {
                    throw new Error('Erreur de connexion.');
                }
            }
            return response.json();
        })
        .then(data => {
            
            if (data.token) {
                localStorage.setItem('authToken', data.token);
                alert('Connexion réussie!');
                window.location.href = './assets/FrondEnd/index.html'; 
            }
        })
        .catch(error => {
            console.error('Erreur :', error);
            errorMessage.textContent = error.message;
        });
    }
});
