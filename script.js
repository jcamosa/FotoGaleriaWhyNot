const API_URL = "https://script.google.com/macros/s/AKfycbyyy1eotg0CjxlreUS53LMI991MOfjVlj7yzxyOIGPkDqVyjqu5NU82UPyhbMoqneLU0A/exec";


let currentGalleryPhotos = [];
let currentIndex = 0;
let slideshowInterval = null;
let isPlaying = false;

document.addEventListener("DOMContentLoaded", () => {
    fetchImages();
});

async function fetchImages() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        window.galleryData = data; // Guardamos los datos globalmente para el slideshow

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
    photos.forEach((photo, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        item.onclick = function() { 
            // Determinamos a qué categoría pertenece según el gridId
            let catKey = gridId.replace('grid-', '');
            currentGalleryPhotos = window.galleryData[catKey];
            currentIndex = index;
            openLightbox();
        };

        const img = document.createElement('img');
        img.src = `https://lh3.googleusercontent.com/d/${photo.id}=w600`;
        img.alt = photo.name;
        img.loading = 'lazy';

        item.appendChild(img);
        grid.appendChild(item);
    });
}

function switchTab(tabId, event) {
    stopSlideshow();
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));

    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(button => button.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

function openLightbox() {
    updateLightboxImage();
    document.getElementById('lightbox').style.display = 'flex';
}

function updateLightboxImage() {
    const photo = currentGalleryPhotos[currentIndex];
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxDownload = document.getElementById('lightbox-download');

    lightboxImg.src = `https://lh3.googleusercontent.com/d/${photo.id}=w1600`;
    lightboxDownload.href = `https://drive.google.com/uc?export=download&id=${photo.id}`;
}

function closeLightbox() {
    stopSlideshow();
    document.getElementById('lightbox').style.display = 'none';
}

// Funciones del Slideshow
function startSlideshow(categoryKey) {
    if (!window.galleryData || !window.galleryData[categoryKey] || window.galleryData[categoryKey].length === 0) return;
    
    currentGalleryPhotos = window.galleryData[categoryKey];
    currentIndex = 0;
    openLightbox();
    
    isPlaying = true;
    document.getElementById('slideshow-toggle').innerText = "⏸ Pausa";
    
    if (slideshowInterval) clearInterval(slideshowInterval);
    slideshowInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % currentGalleryPhotos.length;
        updateLightboxImage();
    }, 3000); // Cambia de foto cada 3 segundos
}

function toggleSlideshowPlay() {
    if (isPlaying) {
        clearInterval(slideshowInterval);
        isPlaying = false;
        document.getElementById('slideshow-toggle').innerText = "▶ Reproducir";
    } else {
        isPlaying = true;
        document.getElementById('slideshow-toggle').innerText = "⏸ Pausa";
        if (slideshowInterval) clearInterval(slideshowInterval);
        slideshowInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % currentGalleryPhotos.length;
            updateLightboxImage();
        }, 3000);
    }
}

function stopSlideshow() {
    if (slideshowInterval) clearInterval(slideshowInterval);
    isPlaying = false;
}

// Cerrar lightbox haciendo clic fuera de la imagen
document.getElementById('lightbox').addEventListener('click', function(event) {
    if (event.target === this) {
        closeLightbox();
    }
});
