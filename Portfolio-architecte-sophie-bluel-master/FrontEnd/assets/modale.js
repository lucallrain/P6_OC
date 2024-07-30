// Fonction pour récupérer et afficher les projets depuis l'API
async function fetchAndDisplayProjects() {
    try {
        const response = await fetch('http://localhost:5678/api/works');
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des projets');
        }
        const projects = await response.json();
        console.log('Projets récupérés:', projects);

        const galleryView = document.getElementById('gallery-view');
        galleryView.innerHTML = ''; // Effacer le contenu précédent

        projects.forEach(project => {
            const projectElement = document.createElement('figure');
            projectElement.innerHTML = `
                <img src="${project.imageUrl}" alt="${project.title}">
                <figcaption>${project.title}</figcaption>
            `;
            galleryView.appendChild(projectElement);
        });
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Variables pour la modale et ses éléments
const modifBtn = document.getElementById("modif");
const modale = document.getElementById("modale");
const closeBtn = document.getElementsByClassName("close")[0];
const showAddViewBtn = document.getElementById("show-add-view");
const showGalleryViewBtn = document.getElementById("show-gallery-view");
const viewGallery = document.getElementById("view-gallery");
const viewAdd = document.getElementById("view-add");

// Ouvrir la modale et afficher la vue Galerie photo
modifBtn.onclick = function() {
    modale.style.display = "block";
    viewGallery.classList.add('active');
    viewAdd.classList.remove('active');
    fetchAndDisplayProjects(); // Charger les projets lors de l'ouverture
}

// Fermer la modale lorsque l'utilisateur clique sur (x)
closeBtn.onclick = function() {
    modale.style.display = "none";
}

// Fermer la modale lorsque l'utilisateur clique en dehors de la modale
window.onclick = function(event) {
    if (event.target == modale) {
        modale.style.display = "none";
    }
}

// Afficher la vue Ajouter photo
showAddViewBtn.onclick = function() {
    viewGallery.classList.remove('active');
    viewAdd.classList.add('active');
}

// Afficher la vue Galerie photo
showGalleryViewBtn.onclick = function() {
    viewGallery.classList.add('active');
    viewAdd.classList.remove('active');
}

// Gestion du formulaire d'ajout
document.getElementById("modale-form").onsubmit = function(event) {
    event.preventDefault();

    const title = document.getElementById("project-title").value;
    const image = document.getElementById("project-image").files[0];
    
    if (title && image) {
        // Créer un objet FormData pour envoyer les données
        const formData = new FormData();
        formData.append("title", title);
        formData.append("image", image);

        fetch('http://localhost:5678/api/works', {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de l\'ajout du projet');
            }
            return response.json();
        })
        .then(data => {
            console.log('Projet ajouté:', data);
            // Ajouter le nouveau projet à la galerie
            const galleryView = document.getElementById('gallery-view');
            const projectElement = document.createElement('figure');
            projectElement.innerHTML = `
                <img src="${URL.createObjectURL(image)}" alt="${title}">
                <figcaption>${title}</figcaption>
            `;
            galleryView.appendChild(projectElement);
            viewGallery.classList.add('active');
            viewAdd.classList.remove('active');
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
    }
}
