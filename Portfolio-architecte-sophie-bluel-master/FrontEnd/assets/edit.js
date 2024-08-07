document.addEventListener("DOMContentLoaded", () => {
  init();
});

function init() {
  fetchWorks();
  loadProjects();
  setupModalEventListeners();
}

async function fetchWorks() {
  try {
    const works = await fetchFromAPI("http://localhost:5678/api/works");
    const categoriesSet = new Set(["Tous", ...works.map(work => work.category.name)]);
    displayWorks(works);
    updateFilterButtons(categoriesSet);
  } catch (error) {
    console.error("Erreur de récupération des données :", error);
  }
}

async function fetchFromAPI(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Erreur HTTP ! statut : ${response.status}`);
  return response.json();
}

function displayWorks(works) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = works.map(work => createFigureHTML(work)).join('');
}

function createFigureHTML(work) {
  return `
    <figure data-name="${work.category?.name || 'Inconnu'}" data-id="${work.id}">
      <img src="${work.imageUrl}" alt="${work.title}">
      <figcaption>${work.title}</figcaption>
    </figure>
  `;
}

async function loadProjects() {
  try {
    const projects = await fetchFromAPI("http://localhost:5678/api/works");
    const gallery = document.querySelector("#portfolio .gallery");
    gallery.innerHTML = projects.map(project => createFigureHTML(project)).join('');
  } catch (error) {
    console.error("Erreur:", error);
  }
}

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

function openModal(event) {
  event.preventDefault();
  const modal = document.getElementById("modal");
  modal.style.display = "block";
  populateGallery();
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "none";
}

async function populateGallery() {
  const galleryModal = document.querySelector(".gallery-modal");
  if (!galleryModal) return;

  try {
    const projects = await fetchFromAPI("http://localhost:5678/api/works");
    galleryModal.innerHTML = projects.map(project => createModalFigureHTML(project)).join('');
  } catch (error) {
    console.error("Erreur:", error);
  }
}

function createModalFigureHTML(project) {
  return `
    <figure data-id="${project.id}">
      <img src="${project.imageUrl}" alt="${project.title}">
      <i class="fa-solid fa-trash-can" onclick="deleteProject(${project.id}, this.closest('figure'))"></i>
    </figure>
  `;
}

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
    document.querySelector(`.gallery figure[data-id='${projectId}']`)?.remove();
    console.log("Project deleted successfully");
  } catch (error) {
    console.error("Erreur de suppression:", error);
  }
}

async function displayAddPhotoForm(event) {
  event.preventDefault();
  const modalContent = document.querySelector(".modal-content");
  const previousContent = modalContent.innerHTML;

  modalContent.innerHTML = `
    <button class="back-button"><i class="fa-solid fa-arrow-left"></i></button>
    <h2 class="form-title">Ajout photo</h2>
    <form id="photo-form" class="photo-form">
      <span class="close">x</span>
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
        <label for="photo-title"></label>
        <input type="text" id="photo-title" name="photo-title">
        <span id="title-error" class="error-message" style="display: none; color: red; font-size: 0.8em;">Le titre est obligatoire</span>
      </div>
      <div class="form-group second_form">
        <p class="title_form">Catégorie</p>
        <label for="photo-category"></label>
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

  document.querySelector(".close").addEventListener('click', closeModal);

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
        photoPreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById("photo-form").addEventListener('submit', async (event) => {
    event.preventDefault();
    await addPhoto();
  });
}

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

  const formData = new FormData();
  formData.append("image", photoFileInput.files[0]);
  formData.append("title", photoTitle);
  formData.append("category", photoCategory);

  try {
    const response = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const createdProject = await response.json();
    document.querySelector(".gallery").innerHTML += createFigureHTML(createdProject);
    closeModal();
    document.getElementById("photo-form").reset();
    window.location.reload(); // Refresh the page after closing the modal
  } catch (error) {
    console.error("Erreur d'ajout de photo:", error);
  }
}
