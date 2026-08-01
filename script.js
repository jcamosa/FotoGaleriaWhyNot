const API_URL = "https://script.google.com/macros/s/AKfycbzD50PXg3w9pIdr5S3TPHYvvfHbg35dzlXZHVV9o5_-yhePnI9vyetfiMHDTQa0RaNQGA/exec";

document.addEventListener("DOMContentLoaded", () => {
    fetchImages();
});

async function fetchImages() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        renderCategory('grid-invitados', data.invitados);
        renderCategory('grid-fotomaton', data.fotomaton);
        renderCategory('grid-fotografa', data.fotografa);
        renderCategory('grid-fotosapp', data.fotosapp);
    } catch (error) {
        console.error("Error al cargar las imágenes:", error);
        document.querySelectorAll('.gallery-grid').forEach(grid => {
            grid.innerHTML = '<p class="loading">Error al cargar las fotos desde Google Drive.</p>';
        });
    }
}

function renderCategory(gridId, photos) {
    const grid = document.getElementById(gridId);
    if (!photos || photos.length === 0) {
        grid.innerHTML = '<p class="loading">No hay fotos en esta carpeta todavía.</p>';
        return;
    }

    grid.innerHTML = "";
    photos.forEach(photo => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.onclick = function() { openLightbox(this); };

        const img = document.createElement('img');
        img.src = `https://lh3.googleusercontent.com/d/${photo.id}=w600`;
        img.alt = photo.name;
        img.loading = 'lazy';

        item.appendChild(img);
        grid.appendChild(item);
    });
}

function switchTab(tabId, event) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));

    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(button => button.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

function openLightbox(element) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const img = element.querySelector('img');

    lightbox.style.display = 'flex';
    lightboxImg.src = img.src;
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none';
}
