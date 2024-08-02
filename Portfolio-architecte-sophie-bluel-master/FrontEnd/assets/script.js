// Fonction pour récupérer les données de l'API
async function fetchWorks() {
    try {
        const categoriesSet = new Set(['Tous']);
        const response = await fetch('http://localhost:5678/api/works');
        if (!response.ok) {
            throw new Error(`Erreur HTTP ! statut : ${response.status}`);
        }
        const works = await response.json();
        works.forEach(work => {
            categoriesSet.add(work.category.name);
        });
        displayWorks(works);
        updateFilterButtons(categoriesSet);
    } catch (error) {
        console.error('Erreur de récupération des données :', error);
    }
}

// Fonction pour afficher les projets dans la galerie
function displayWorks(works) {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = '';
    works.forEach(work => {
        const figure = document.createElement('figure');

        figure.innerHTML = `
            <img src="${work.imageUrl}" alt="${work.title}">
            <figcaption>${work.title}</figcaption>
        `;
        figure.setAttribute('data-name', work.category.name);
        figure.setAttribute('data-id', work.id);
        gallery.appendChild(figure);
    });
}

// Fonction pour mettre à jour les boutons de filtre
function updateFilterButtons(categoriesSet) {
    const buttonsContainer = document.querySelector('.buttons__container');
    buttonsContainer.innerHTML = '';
    categoriesSet.forEach(category => {
        const button = document.createElement('button');
        button.classList.add('Menu__Button');
        button.textContent = category;
        button.addEventListener('click', () => filterWorks(category));
        buttonsContainer.appendChild(button);
    });
}

// Fonction pour filtrer les projets
function filterWorks(category) {
    const allFigures = document.querySelectorAll('.gallery figure');
    allFigures.forEach(figure => {
        const workName = figure.getAttribute('data-name');
        if (category === 'Tous' || workName === category) {
            figure.style.display = '';
        } else {
            figure.style.display = 'none';
        }
    });
}

// Fonction pour récupérer le token d'authentification
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Fonction pour supprimer un projet
function deleteProject(projectId, projectElement) {
    const authToken = getAuthToken();
    if (!authToken) {
        console.error('No auth token found');
        return;
    }

    fetch(`http://localhost:5678/api/works/${projectId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(() => {
        projectElement.remove();
        const mainGalleryElement = document.querySelector(`.gallery figure[data-id='${projectId}']`);
        if (mainGalleryElement) {
            mainGalleryElement.remove();
        }
        console.log('Project deleted successfully');
    })
    .catch(error => console.error('Erreur de suppression:', error));
}

// Fonction pour charger les projets depuis l'API et mettre à jour le DOM
function loadProjects() {
    fetch('http://localhost:5678/api/works')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const gallery = document.querySelector('#portfolio .gallery');
            if (gallery) {
                gallery.innerHTML = ''; // Vider le contenu existant

                data.forEach(project => {
                    const figure = createProjectFigure(project);
                    gallery.appendChild(figure);
                });
            }
        })
        .catch(error => console.error('Erreur:', error));
}

// Fonction pour créer un élément figure pour un projet
function createProjectFigure(project) {
    const figure = document.createElement('figure');
    figure.setAttribute('data-id', project.id);

    const img = document.createElement('img');
    img.setAttribute('src', project.imageUrl);
    img.setAttribute('alt', project.title);
    figure.appendChild(img);

    const figcaption = document.createElement('figcaption');
    figcaption.textContent = project.title;
    figure.appendChild(figcaption);

    return figure;
}

// Récupère la modale
const modal = document.getElementById("modal");

// Récupère le bouton qui ouvre la modale
const btn = document.getElementById("modif");

// Récupère l'élément <span> qui ferme la modale
const span = document.getElementsByClassName("close")[0];

// Lorsque l'utilisateur clique sur le bouton, ouvre la modale 
if (btn) {
    btn.onclick = function() {
        modal.style.display = "block";
        populateGallery();
    }
}

// Lorsque l'utilisateur clique sur <span> (x), ferme la modale
if (span) {
    span.onclick = function() {
        modal.style.display = "none";
    }
}

// Lorsque l'utilisateur clique n'importe où en dehors de la modale, la ferme
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Fonction pour remplir la galerie dans la modale
function populateGallery() {
    const gallery = document.querySelector('.gallery-modal');
    if (gallery) {
        gallery.innerHTML = '';

        fetch('http://localhost:5678/api/works')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                data.forEach(project => {
                    const figure = document.createElement('figure');
                    figure.setAttribute('data-id', project.id);

                    const img = document.createElement('img');
                    img.setAttribute('src', project.imageUrl);
                    img.setAttribute('alt', project.title);

                    const trashIcon = document.createElement('i');
                    trashIcon.classList.add('fa-solid', 'fa-trash-can', 'trash-icon');
                    trashIcon.onclick = function() {
                        deleteProject(project.id, figure);
                    };

                    figure.appendChild(img);
                    figure.appendChild(trashIcon);

                    gallery.appendChild(figure);
                });
            })
            .catch(error => console.error('Erreur:', error));
    }
}

// Regrouper tous les appels de DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    fetchWorks();
    loadProjects();
});
