// Función para cambiar de pestaña
function switchTab(tabId) {
    // Ocultar todos los contenidos
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));

    // Quitar la clase active de todos los botones
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(button => button.classList.remove('active'));

    // Mostrar la pestaña seleccionada y activar su botón
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Función para abrir la imagen en grande (Lightbox)
function openLightbox(element) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const img = element.querySelector('img');

    lightbox.style.display = 'flex';
    lightboxImg.src = img.src;
}

// Función para cerrar el Lightbox
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none';
}
