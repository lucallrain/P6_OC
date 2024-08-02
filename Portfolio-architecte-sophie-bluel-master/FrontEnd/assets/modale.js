
    document.addEventListener('DOMContentLoaded', (event) => {
        loadProjects();
    });

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

    