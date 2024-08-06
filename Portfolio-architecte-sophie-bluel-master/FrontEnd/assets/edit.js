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
    const categoriesSet = new Set(["Tous"]);
    const works = await fetchFromAPI("http://localhost:5678/api/works");

    works.forEach(work => categoriesSet.add(work.category.name));
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
  gallery.innerHTML = "";
  works.forEach(work => {
    const figure = createFigure(work);
    gallery.appendChild(figure);
  });
}

function createFigure(work) {
  const figure = document.createElement("figure");
  figure.innerHTML = `
    <img src="${work.imageUrl}" alt="${work.title}">
    <figcaption>${work.title}</figcaption>
  `;
  figure.setAttribute("data-name", work.category.name);
  figure.setAttribute("data-id", work.id);
  return figure;
}

async function loadProjects() {
  try {
    const projects = await fetchFromAPI("http://localhost:5678/api/works");
    const gallery = document.querySelector("#portfolio .gallery");
    gallery.innerHTML = "";
    projects.forEach(project => {
      const figure = createFigure(project);
      gallery.appendChild(figure);
    });
  } catch (error) {
    console.error("Erreur:", error);
  }
}

function setupModalEventListeners() {
  const openModalButton = document.getElementById("modif");
  const closeModalButton = document.querySelector(".close");
  const addPhotoButton = document.getElementById("add-photo");

  if (openModalButton) {
    openModalButton.addEventListener('click', openModal);
  }

  if (closeModalButton) {
    closeModalButton.addEventListener('click', closeModal);
  }

  window.addEventListener('click', event => {
    if (event.target == modal) {
      closeModal();
    }
  });

  if (addPhotoButton) {
    addPhotoButton.addEventListener('click', displayAddPhotoForm);
  }
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

  galleryModal.innerHTML = "";
  try {
    const projects = await fetchFromAPI("http://localhost:5678/api/works");
    projects.forEach(project => {
      const figure = createModalFigure(project);
      galleryModal.appendChild(figure);
    });
  } catch (error) {
    console.error("Erreur:", error);
  }
}

function createModalFigure(project) {
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

  return figure;
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
    const mainGalleryElement = document.querySelector(`.gallery figure[data-id='${projectId}']`);
    if (mainGalleryElement) {
      mainGalleryElement.remove();
    }
    console.log("Project deleted successfully");
  } catch (error) {
    console.error("Erreur de suppression:", error);
  }
}

async function displayAddPhotoForm(event) {
  event.preventDefault();
  const modalContent = document.querySelector(".modal-content");
  const previousContent = modalContent.innerHTML; // Save the current content

  modalContent.innerHTML = ""; // Clear existing content

  const backButton = document.createElement("button");
  backButton.classList.add("back-button");
  backButton.innerHTML = `<i class="fa-solid fa-arrow-left"></i>`;
  backButton.addEventListener('click', () => {
    modalContent.innerHTML = previousContent; // Restore the previous content
    setupModalEventListeners(); // Re-setup event listeners for the restored content
  });
  modalContent.appendChild(backButton);

  const formTitle = document.createElement("h2");
  formTitle.textContent = "Ajout photo";
  formTitle.classList.add("form-title");
  modalContent.appendChild(formTitle);

  const form = document.createElement("form");
  form.id = "photo-form";
  form.classList.add("photo-form");
  form.innerHTML = `
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
    </div>
    <div class="form-group second_form">
      <p class="title_form">Catégorie</p>
      <label for="photo-category"></label>
      <select id="photo-category" name="photo-category" required>
        <!-- Add options dynamically -->
      </select>
    </div>
    <div class="form-separator"></div>
    <button type="submit" class="submit-button">Valider</button>
  `;
  modalContent.appendChild(form);

  // Add event listener to close span
  const closeSpan = form.querySelector(".close");
  closeSpan.addEventListener('click', closeModal);

  // Fetch and populate categories
  await populateCategories();

  const photoFileInput = form.querySelector("#photo-file");
  const uploadButton = form.querySelector(".upload-text");
  const photoPreview = form.querySelector("#photo-preview");

  uploadButton.addEventListener('click', () => {
    photoFileInput.click();
  });

  photoFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        photoPreview.src = e.target.result;
        photoPreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await addPhoto();
  });
}

async function populateCategories() {
  const categories = [
    { id: 1, name: "Objets" },
    { id: 2, name: "Appartements" },
    { id: 3, name: "Hotels & restaurants" }
  ];

  const categorySelect = document.getElementById("photo-category");
  categorySelect.innerHTML = categories.map(category => 
    `<option value="${category.id}">${category.name}</option>`
  ).join('');
}

async function addPhoto() {
  const photoFileInput = document.getElementById("photo-file");
  const photoTitle = document.getElementById("photo-title").value || ""; // Allow empty title
  const photoCategory = document.getElementById("photo-category").value;

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
    const gallery = document.querySelector(".gallery");
    const figure = createFigure(createdProject);
    gallery.appendChild(figure);
    closeModal();
    document.getElementById("photo-form").reset();
  } catch (error) {
    console.error("Erreur d'ajout de photo:", error);
  }
}
