// Fonction pour récupérer les données de l'API
async function fetchWorks() {
  try {
    const categoriesSet = new Set(["Tous"]);
    const response = await fetch("http://localhost:5678/api/works");
    if (!response.ok) {
      throw new Error(`Erreur HTTP ! statut : ${response.status}`);
    }
    const works = await response.json();
    works.forEach((work) => {
      categoriesSet.add(work.category.name);
    });
    displayWorks(works);
    updateFilterButtons(categoriesSet);
  } catch (error) {
    console.error("Erreur de récupération des données :", error);
  }
}

// Fonction pour afficher les projets dans la galerie
function displayWorks(works) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";
  works.forEach((work) => {
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

// Fonction pour mettre à jour les boutons de filtre
function updateFilterButtons(categoriesSet) {
  const buttonsContainer = document.querySelector(".buttons__container");
  buttonsContainer.innerHTML = "";
  categoriesSet.forEach((category) => {
    const button = document.createElement("button");
    button.classList.add("Menu__Button");
    button.textContent = category;
    button.addEventListener("click", () => filterWorks(category));
    buttonsContainer.appendChild(button);
  });
}

// Fonction pour filtrer les projets
function filterWorks(category) {
  const allFigures = document.querySelectorAll(".gallery figure");
  allFigures.forEach((figure) => {
    const workName = figure.getAttribute("data-name");
    if (category === "Tous" || workName === category) {
      figure.style.display = "";
    } else {
      figure.style.display = "none";
    }
  });
}

fetchWorks()
