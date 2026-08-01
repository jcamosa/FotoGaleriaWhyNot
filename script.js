const API_URL = "https://script.google.com/macros/s/AKfycbyyy1eotg0CjxlreUS53LMI991MOfjVlj7yzxyOIGPkDqVyjqu5NU82UPyhbMoqneLU0A/exec";

let currentGalleryPhotos = [];
let currentIndex = 0;
let slideshowInterval = null;
let isPlaying = false;

// Variables para detectar gestos táctiles (Swipe en móviles)
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener("DOMContentLoaded", () => {
    fetchImages();
    setupSwipeGestures();
});

async function fetchImages() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        window.galleryData = data;

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
            let catKey = gridId.replace('grid-', '');
            currentGalleryPhotos = window.galleryData[catKey];
            currentIndex = index;
            stopSlideshow(); // Se abre independiente sin autoplay
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
    if (!currentGalleryPhotos || currentGalleryPhotos.length === 0) return;
    const photo = currentGalleryPhotos[currentIndex];
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxDownload = document.getElementById('lightbox-download');

    // Fluidez: usamos =w1200 para que cargue rápido al ampliar, y descarga original intacta
    lightboxImg.src = `https://lh3.googleusercontent.com/d/${photo.id}=w1200`;
    lightboxDownload.href = `https://drive.google.com/uc?export=download&id=${photo.id}`;
}

function closeLightbox() {
    stopSlideshow();
    document.getElementById('lightbox').style.display = 'none';
}

// Controles manuales de avance y retroceso
function nextImage() {
    if (currentGalleryPhotos.length === 0) return;
    currentIndex = (currentIndex + 1) % currentGalleryPhotos.length;
    updateLightboxImage();
}

function prevImage() {
    if (currentGalleryPhotos.length === 0) return;
    currentIndex = (currentIndex - 1 + currentGalleryPhotos.length) % currentGalleryPhotos.length;
    updateLightboxImage();
}

// Funciones del Slideshow automático
function startSlideshow(categoryKey) {
    if (!window.galleryData || !window.galleryData[categoryKey] || window.galleryData[categoryKey].length === 0) return;
    
    currentGalleryPhotos = window.galleryData[categoryKey];
    currentIndex = 0;
    openLightbox();
    
    isPlaying = true;
    document.getElementById('slideshow-toggle').innerText = "⏸ Pausa Auto";
    
    if (slideshowInterval) clearInterval(slideshowInterval);
    slideshowInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % currentGalleryPhotos.length;
        updateLightboxImage();
    }, 3500); // 3.5 segundos por foto
}

function toggleSlideshowPlay() {
    if (isPlaying) {
        clearInterval(slideshowInterval);
        isPlaying = false;
        document.getElementById('slideshow-toggle').innerText = "▶ Play Auto";
    } else {
        isPlaying = true;
        document.getElementById('slideshow-toggle').innerText = "⏸ Pausa Auto";
        if (slideshowInterval) clearInterval(slideshowInterval);
        slideshowInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % currentGalleryPhotos.length;
            updateLightboxImage();
        }, 3500);
    }
}

function stopSlideshow() {
    if (slideshowInterval) clearInterval(slideshowInterval);
    isPlaying = false;
    const toggleBtn = document.getElementById('slideshow-toggle');
    if (toggleBtn) toggleBtn.innerText = "▶ Play Auto";
}

// Soporte para gestos táctiles (Swipe en móviles para cambiar de foto)
function setupSwipeGestures() {
    const lightbox = document.getElementById('lightbox');

    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, {passive: true});

    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, {passive: true});
}

function handleSwipe() {
    const threshold = 50; // Mínimo de píxeles de desplazamiento para considerarse swipe
    if (touchEndX < touchStartX - threshold) {
        // Deslizar a la izquierda -> Siguiente foto
        nextImage();
    }
    if (touchEndX > touchStartX + threshold) {
        // Deslizar a la derecha -> Foto anterior
        prevImage();
    }
}

// Cerrar lightbox haciendo clic en el fondo oscuro
document.getElementById('lightbox').addEventListener('click', function(event) {
    if (event.target === this) {
        closeLightbox();
    }
});
