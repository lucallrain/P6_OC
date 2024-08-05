document.addEventListener("DOMContentLoaded", () => {
  fetchWorks();
  loadProjects();
});

// Fonction pour récupérer et afficher les projets dans la galerie principale
async function fetchWorks() {
  try {
    const categoriesSet = new Set(["Tous"]);
    const response = await fetch("http://localhost:5678/api/works");
    if (!response.ok) throw new Error(`Erreur HTTP ! statut : ${response.status}`);

    const works = await response.json();
    works.forEach(work => categoriesSet.add(work.category.name));

    displayWorks(works);
    updateFilterButtons(categoriesSet);
  } catch (error) {
    console.error("Erreur de récupération des données :", error);
  }
}

// Fonction pour afficher les projets dans la galerie principale
function displayWorks(works) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";
  works.forEach(work => {
    const figure = document.createElement("figure");
    figure.innerHTML = `
      <img src="${work.imageUrl}" alt="${work.title}">
      <figcaption>${work.title}</figcaption>
    `;
    figure.setAttribute("data-name", work.category.name);
    figure.setAttribute("data-id", work.id);
    gallery.appendChild(figure);
  });
}

// Fonction pour charger les projets dans la galerie principale au chargement de la page
async function loadProjects() {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    if (!response.ok) throw new Error("Network response was not ok");

    const projects = await response.json();
    const gallery = document.querySelector("#portfolio .gallery");
    gallery.innerHTML = "";
    projects.forEach(project => {
      const figure = createProjectFigure(project);
      gallery.appendChild(figure);
    });
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Fonction pour créer un élément figure pour un projet
function createProjectFigure(project) {
  const figure = document.createElement("figure");
  figure.setAttribute("data-id", project.id);

  const img = document.createElement("img");
  img.setAttribute("src", project.imageUrl);
  img.setAttribute("alt", project.title);
  figure.appendChild(img);

  const figcaption = document.createElement("figcaption");
  figcaption.textContent = project.title;
  figure.appendChild(figcaption);

  return figure;
}

// Récupération des éléments de la modale
const modal = document.getElementById("modal");
const openModalButton = document.getElementById("modif");
const closeModalButton = document.getElementsByClassName("close")[0];

// Ouvrir la modale au clic sur le bouton
if (openModalButton) {
  openModalButton.addEventListener('click', event => {
    event.preventDefault();
    modal.style.display = "block";
    populateGallery();
  });
}

// Fermer la modale au clic sur <span> (x)
if (closeModalButton) {
  closeModalButton.addEventListener('click', () => {
    modal.style.display = "none";
  });
}

// Fermer la modale au clic en dehors de celle-ci
window.addEventListener('click', event => {
  if (event.target == modal) {
    modal.style.display = "none";
  }
});

// Fonction pour remplir la galerie dans la modale
async function populateGallery() {
  const galleryModal = document.querySelector(".gallery-modal");
  if (galleryModal) {
    galleryModal.innerHTML = "";

    try {
      const response = await fetch("http://localhost:5678/api/works");
      if (!response.ok) throw new Error("Network response was not ok");

      const projects = await response.json();
      projects.forEach(project => {
        const figure = document.createElement("figure");
        figure.setAttribute("data-id", project.id);

        const img = document.createElement("img");
        img.setAttribute("src", project.imageUrl);
        img.setAttribute("alt", project.title);
        figure.appendChild(img);

        const trashIcon = document.createElement("i");
        trashIcon.classList.add("fa-solid", "fa-trash-can");
        trashIcon.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          deleteProject(project.id, figure);
        });
        figure.appendChild(trashIcon);

        galleryModal.appendChild(figure);
      });
    } catch (error) {
      console.error("Erreur:", error);
    }
  }
}

// Fonction pour supprimer un projet
async function deleteProject(projectId, projectElement) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    console.error("No auth token found");
    return;
  }

  try {
    const response = await fetch(`http://localhost:5678/api/works/${projectId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Network response was not ok");

    projectElement.remove();
    const mainGalleryElement = document.querySelector(`.gallery figure[data-id='${projectId}']`);
    if (mainGalleryElement) {
      mainGalleryElement.remove();
    }
    console.log("Project deleted successfully");
  } catch (error) {
    console.error("Erreur de suppression:", error);
  }
}
