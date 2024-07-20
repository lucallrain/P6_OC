document.addEventListener("DOMContentLoaded", function () {
    // Sélectionner le formulaire de connexion
    const loginForm = document.querySelector('#contact form');

    // Sélectionner les champs d'entrée
    const emailInput = document.querySelector('#email');
    const passwordInput = document.querySelector('#pass');
    const errorMessage = document.createElement('div');
    errorMessage.style.color = 'red';
    errorMessage.style.marginTop = '10px';

    // Ajouter le message d'erreur sous le bouton de connexion
    loginForm.appendChild(errorMessage);

    // Fonction pour valider l'email
    function validateEmail(email) {
        // Expression régulière pour valider l'email
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    }

    // Préremplir les champs avec les identifiants de test pour Sophie Bluel
    emailInput.value = 'sophie.bluel@test.tld';
    passwordInput.value = 'S0phie';

    // Gestionnaire de soumission du formulaire
    loginForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Empêcher la soumission du formulaire

        // Réinitialiser le message d'erreur
        errorMessage.textContent = '';

        // Valider les champs d'entrée
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

        // Requête à l'API pour vérifier les identifiants
        loginUser(email, password);
    });

    // Fonction pour vérifier les identifiants via l'API
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
            // Gérer les données reçues
            if (data.token) {
                // Stocker le token de l'utilisateur pour une utilisation future
                localStorage.setItem('authToken', data.token);
                alert('Connexion réussie!');
                // Rediriger vers la page d'accueil
                window.location.href = '/Portfolio-architecte-sophie-bluel-master/FrontEnd/index.html'; // Assurez-vous que l'URL correspond à votre page d'accueil
            }
        })
        .catch(error => {
            console.error('Erreur :', error);
            errorMessage.textContent = error.message;
        });
    }
});
