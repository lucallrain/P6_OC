
    // Récupère la modale
    var modal = document.getElementById("modal");

    // Récupère le bouton qui ouvre la modale
    var btn = document.getElementById("modif");

    // Récupère l'élément <span> qui ferme la modale
    var span = document.getElementsByClassName("close")[0];

    // Lorsque l'utilisateur clique sur le bouton, ouvre la modale 
    btn.onclick = function() {
        modal.style.display = "block";
        populateGallery();
    }

    // Lorsque l'utilisateur clique sur <span> (x), ferme la modale
    span.onclick = function() {
        modal.style.display = "none";
    }

    // Lorsque l'utilisateur clique n'importe où en dehors de la modale, la ferme
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Fonction pour remplir la galerie dans la modale
    function populateGallery() {
        var gallery = document.querySelector('.gallery-modal');
        gallery.innerHTML = '';

        var images = document.querySelectorAll('#portfolio .gallery figure img');
        images.forEach(function(image) {
            var figure = document.createElement('figure');
            var imgClone = image.cloneNode(true);
            
            var trashIcon = document.createElement('i');
            trashIcon.classList.add('fa', 'fa-trash', 'trash-icon');

            figure.appendChild(imgClone);
            figure.appendChild(trashIcon);

            gallery.appendChild(figure);
        });
    }

