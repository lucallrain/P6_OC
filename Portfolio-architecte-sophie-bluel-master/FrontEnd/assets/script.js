// Ensemble pour stocker les catégories uniques, y compris "Tous"
const categoriesSet = new Set(['Tous']);

// Fonction pour récupérer les données de l'API
async function fetchWorks() {
    try {
        // Effectuer une requête GET à l'API
        const response = await fetch('http://localhost:5678/api/works');

        // Vérifier si la requête a réussi
        if (!response.ok) {
            throw new Error(`Erreur HTTP ! statut : ${response.status}`);
        }

        // Analyser la réponse en JSON
        const works = await response.json();

        // Ajouter les catégories uniques à l'ensemble
        works.forEach(work => {
            categoriesSet.add(work.category.name);
        });

        // Afficher les projets dans la galerie
        displayWorks(works);

        // Mettre à jour les boutons de filtre
        updateFilterButtons();
    } catch (error) {
        // Gérer les erreurs
        console.error('Erreur de récupération des données :', error);
    }
}

// Fonction pour afficher les projets dans la galerie
function displayWorks(works) {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = ''; // Réinitialiser le contenu de la galerie

    works.forEach(work => {
        const figure = document.createElement('figure');
        
        figure.innerHTML = `
            <img src="${work.imageUrl}" alt="${work.title}">
            <figcaption>${work.title}</figcaption>
        `;

        // Ajouter une propriété data-name pour faciliter le filtrage
        figure.setAttribute('data-name', work.category.name);

        gallery.appendChild(figure);
    });
}

// Fonction pour mettre à jour les boutons de filtre
function updateFilterButtons() {
    const buttonsContainer = document.querySelector('.buttons__container');
    buttonsContainer.innerHTML = ''; // Réinitialiser le contenu des boutons

    // Ajouter un bouton pour chaque catégorie unique
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
        // Utiliser data-name pour le filtrage
        const workName = figure.getAttribute('data-name');
        if (category === 'Tous' || workName === category) {
            figure.style.display = '';
        } else {
            figure.style.display = 'none';
        }
    });
}

// Appeler la fonction pour récupérer et afficher les projets au chargement de la page
document.addEventListener("DOMContentLoaded", fetchWorks);
