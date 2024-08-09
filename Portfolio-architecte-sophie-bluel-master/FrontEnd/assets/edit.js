document.addEventListener("DOMContentLoaded", () => {
  init();
});

// Fonction d'initialisation
function init() {
  fetchAndDisplayWorks();
  loadProjectsIntoPortfolio();
  setupModalEventListeners();
}

// Fonction de récupération
async function fetchAndDisplayWorks() {
  try {
    const works = await fetchFromAPI("http://localhost:5678/api/works");
    displayWorks(works);
  } catch (error) {
    console.error("Erreur de récupération des données :", error);
  }
}

// Fonction principale et return en JSON
async function fetchFromAPI(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Erreur HTTP ! statut : ${response.status}`);
  return response.json();
}

// Fonction d'affichage 
function displayWorks(works) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = works.map(createFigureHTML).join('');
}

// Fonction de création de HTML (fig)
function createFigureHTML(work) {
  return `
    <figure data-name="${work.category?.name || 'Inconnu'}" data-id="${work.id}">
      <img src="${work.imageUrl}" alt="${work.title}">
      <figcaption>${work.title}</figcaption>
    </figure>
  `;
}

async function loadProjectsIntoPortfolio() {
  try {
    const projects = await fetchFromAPI("http://localhost:5678/api/works"); // Récupère les projets depuis l'API
    const gallery = document.querySelector("#portfolio .gallery"); // Sélectionne l'élément de la galerie du portfolio
    gallery.innerHTML = projects.map(createFigureHTML).join(''); // Génère le HTML pour chaque projet et l'insère dans la galerie
  } catch (error) {
    console.error("Erreur:", error); // Gère les erreurs de récupération des projets
  }
}

// Fonction config des modales
function setupModalEventListeners() {
  document.getElementById("modif")?.addEventListener('click', openModal);
  document.querySelector(".close")?.addEventListener('click', closeModal);
  document.getElementById("add-photo")?.addEventListener('click', displayAddPhotoForm);

  window.addEventListener('click', event => {
    if (event.target === document.getElementById("modal")) {
      closeModal();
    }
  });
}

// Fonction d'ouverture
function openModal(event) {
  event.preventDefault(); // Empêche le comportement par défaut du lien
  const modal = document.getElementById("modal");
  modal.style.display = "block"; // Affiche la modale
  populateModalGallery(); // Remplit la galerie de la modale avec les projets
}

// Fonctionn de fermeture
function closeModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "none"; // Masque la modale
}

// Fonction de remplissage modale 
async function populateModalGallery() {
  const galleryModal = document.querySelector(".gallery-modal");
  if (!galleryModal) return;

  try {
    const projects = await fetchFromAPI("http://localhost:5678/api/works");
    galleryModal.innerHTML = projects.map(createModalFigureHTML).join('');
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Fonction de la trash
function createModalFigureHTML(project) {
  return `
    <figure data-id="${project.id}">
      <img src="${project.imageUrl}" alt="${project.title}">
      <i class="fa-solid fa-trash-can" onclick="deleteProject(${project.id}, this.closest('figure'))"></i>
    </figure>
  `;
}

// Fonction suppression Projet 
async function deleteProject(projectId, projectElement) {
  const token = localStorage.getItem("authToken"); // Récupère le token d'authentification
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

    projectElement.remove(); // Retire l'élément figure de la galerie après suppression
    document.querySelector(`.gallery figure[data-id='${projectId}']`)?.remove(); // Retire aussi l'élément de la galerie principale
    console.log("Project deleted successfully");
  } catch (error) {
    console.error("Erreur de suppression:", error); // Gère les erreurs de suppression du projet
  }
}

// Fonction 2nd modale
async function displayAddPhotoForm(event) {
  event.preventDefault();
  const modalContent = document.querySelector(".modal-content");
  const previousContent = modalContent.innerHTML;

  modalContent.innerHTML = `
    <button class="back-button"><i class="fa-solid fa-arrow-left"></i></button>
    <h2 class="form-title">Ajout photo</h2>
    <form id="photo-form" class="photo-form">
      <i class="fa-sharp fa-solid fa-xmark close"></i>
      <div class="form-group photo-upload">
        <label for="photo-file" class="photo-label">
          <div class="photo-upload-box">
            <i class="fa-regular fa-image picture_icon"></i>
            <button type="button" class="upload-text">+ Ajouter photo</button>
            <input type="file" id="photo-file" name="photo-file" accept="image/*" class="photo-input" style="display: none;">
            <img id="photo-preview" class="photo-preview">
            <p class="upload-subtext">jpg, png : 4mo max</p>
          </div>
        </label>
      </div>
      <div class="form-group second_form">
        <p class="title_form">Titre</p>
        <input type="text" id="photo-title" name="photo-title">
        <span id="title-error" class="error-message" style="display: none; color: red; font-size: 0.8em;">Le titre est obligatoire</span>
      </div>
      <div class="form-group second_form">
        <p class="title_form">Catégorie</p>
        <select id="photo-category" name="photo-category" required></select>
      </div>
      <div class="form-separator"></div>
      <button type="submit" class="submit-button">Valider</button>
    </form>
  `;


  document.querySelector(".back-button").addEventListener('click', () => {
    modalContent.innerHTML = previousContent;
    setupModalEventListeners();
  });

  // Fonction cross
  document.querySelector(".fa-sharp.fa-solid.fa-xmark")?.addEventListener('click', closeModal);


  await populateCategories();

  
  document.querySelector(".upload-text").addEventListener('click', () => {
    document.getElementById("photo-file").click();
  });


  document.getElementById("photo-file").addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoPreview = document.getElementById("photo-preview");
        photoPreview.src = e.target.result;
        photoPreview.style.display = "block"; // Affiche l'aperçu de la photo
      };
      reader.readAsDataURL(file);
    }
  });

 
  document.getElementById("photo-form").addEventListener('submit', async (event) => {
    event.preventDefault();
    await addPhoto();
  });
}

// Fonction de récup des cat via API
async function populateCategories() {
  try {
    const categories = await fetchFromAPI("http://localhost:5678/api/categories");
    const categorySelect = document.getElementById("photo-category");
    categorySelect.innerHTML = categories.map(category =>
      `<option value="${category.id}">${category.name}</option>`
    ).join('');
  } catch (error) {
    console.error("Erreur de récupération des catégories :", error); 
  }
}

// Fonction de de l'Add
async function addPhoto() {
  const photoFileInput = document.getElementById("photo-file");
  const photoTitle = document.getElementById("photo-title").value;
  const photoCategory = document.getElementById("photo-category").value;
  const titleError = document.getElementById("title-error");

  if (!photoTitle) {
    titleError.style.display = "block";
    return;
  } else {
    titleError.style.display = "none";
  }

  const formData = new FormData(); // Crée un objet FormData pour envoyer les données du formulaire (El famoso)
  formData.append("image", photoFileInput.files[0]);
  formData.append("title", photoTitle);
  formData.append("category", photoCategory);

  try {
    const response = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: formData, // el famoso famoso
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const createdProject = await response.json();
    document.querySelector(".gallery").innerHTML += createFigureHTML(createdProject);
    closeModal();
    document.getElementById("photo-form").reset();
    window.location.reload();
  } catch (error) {
    console.error("Erreur d'ajout de photo:", error);
  }
}
