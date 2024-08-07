document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector("#contact form");
    const emailInput = document.querySelector("#email");
    const passwordInput = document.querySelector("#pass");
    const forgotPasswordLink = document.querySelector("#forgot");
    const submitButton = loginForm.querySelector('input[type="submit"]');
    const title = document.querySelector("#contact h2"); // Sélectionne le titre "Log In"
    const errorMessage = document.createElement("div");
    errorMessage.classList.add("error-message"); // Ajoute la classe ici
    errorMessage.style.fontWeight = "bold"; // Ajoute le style en gras
    errorMessage.style.color = "red"; // Ajoute le style en rouge
  
    // Fonction validation email
    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    }
  
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
  
        errorMessage.textContent = "";
  
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
  
        if (!email || !validateEmail(email)) {
            errorMessage.textContent = "Veuillez entrer une adresse e-mail valide.";
            title.insertAdjacentElement('afterend', errorMessage); // Insère le message d'erreur après le titre
            return;
        }
  
        if (!password) {
            errorMessage.textContent = "Veuillez entrer un mot de passe.";
            title.insertAdjacentElement('afterend', errorMessage); // Insère le message d'erreur après le titre
            return;
        }
  
        loginUser(email, password);
    });
  
    // Fonction de connexion
    function loginUser(email, password) {
        fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: email, password: password }),
        })
        .then((response) => {
            if (!response.ok) {
                if (response.status === 404 || response.status === 401) {
                    throw new Error("Email ou mot de passe incorrect.");
                } else {
                    throw new Error("Erreur de connexion.");
                }
            }
            return response.json();
        })
        .then((data) => {
            if (data.token) {
                localStorage.setItem("authToken", data.token);
                console.log("Token enregistré : ", localStorage.getItem("authToken"));
                window.location.href = "/assets/edit.html";
            }
        })
        .catch((error) => {
            console.error("Erreur :", error);
            errorMessage.textContent = error.message;
            title.insertAdjacentElement('afterend', errorMessage); // Insère le message d'erreur après le titre
        });
    }
  });
  