document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector("#contact form");
    const emailInput = document.querySelector("#email");
    const passwordInput = document.querySelector("#pass");
    const title = document.querySelector("#contact h2");
    const errorMessage = createErrorMessage();

   
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        clearErrorMessage();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!isEmailValid(email)) {
            showErrorMessage("Veuillez entrer une adresse e-mail valide.");
            return;
        }

        if (!password) {
            showErrorMessage("Veuillez entrer un mot de passe.");
            return;
        }

        loginUser(email, password);
    });

    

    // fonction si mauvais mail/mdp clear pour retape
    function clearErrorMessage() {
        errorMessage.textContent = "";
    }

    // fonction info erronée 
    function showErrorMessage(message) {
        errorMessage.textContent = message;
        title.insertAdjacentElement('afterend', errorMessage);
    }

    // fonction du message d'erreur 
    function createErrorMessage() {
        const errorMessage = document.createElement("div");
        errorMessage.classList.add("error-message");
        errorMessage.style.fontWeight = "bold";
        errorMessage.style.color = "red";
        return errorMessage;
    }

    // fonction email validator
    function isEmailValid(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    }

    // fonction de connexion
    function loginUser(email, password) {
        fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 404 || response.status === 401) {
                    throw new Error("Email ou mot de passe incorrect.");
                } else {
                    throw new Error("Erreur de connexion.");
                }
            }
            return response.json();
        })
        .then(data => {
            if (data.token) {
                localStorage.setItem("authToken", data.token);
                console.log("Token enregistré : ", localStorage.getItem("authToken"));
                window.location.href = "/assets/edit.html";
            }
        })
        .catch(error => {
            console.error("Erreur :", error);
            showErrorMessage(error.message);
        });
    }
});
