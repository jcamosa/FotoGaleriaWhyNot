const API_URL = "https://script.google.com/macros/s/AKfycbyyy1eotg0CjxlreUS53LMI991MOfjVlj7yzxyOIGPkDqVyjqu5NU82UPyhbMoqneLU0A/exec";


let currentGalleryPhotos = [];
let currentIndex = 0;
let slideshowInterval = null;
let isPlaying = false;

// Variables para gestos táctiles (Swipe en móviles)
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
            stopSlideshow(); // Apertura independiente
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

    // Visualización fluida con compresión intermedia (=w1200)
    lightboxImg.src = `https://lh3.googleusercontent.com/d/${photo.id}=w1200`;
}

// Descarga directa a tamaño original forzando guardado en galería/dispositivo
async function downloadOriginalPhoto() {
    if (!currentGalleryPhotos || currentGalleryPhotos.length === 0) return;
    const photo = currentGalleryPhotos[currentIndex];
    
    // Enlace de descarga directa oficial de Google Drive
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${photo.id}`;

    try {
        // Forzamos descarga limpia mediante fetch y blob para que vaya directo al dispositivo/galería
        const response = await fetch(downloadUrl);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = photo.name || 'foto-boda.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
        // Fallback por si el navegador bloquea el blob de seguridad
        window.open(downloadUrl, '_blank');
    }
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

// Controles de la Presentación Automática
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
    }, 3500); // 3.5 segundos por foto
}

function toggleSlideshowPlay() {
    if (isPlaying) {
        clearInterval(slideshowInterval);
        isPlaying = false;
        document.getElementById('slideshow-toggle').innerText = "▶ Reproducción automática";
    } else {
        isPlaying = true;
        document.getElementById('slideshow-toggle').innerText = "⏸ Pausa";
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
    if (toggleBtn) toggleBtn.innerText = "▶ Reproducción automática";
}

// Gestos táctiles (Swipe en móviles para pasar fotos deslizando)
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
    const threshold = 50; // Mínimo de píxeles para activar el gesto
    if (touchEndX < touchStartX - threshold) {
        nextImage(); // Deslizar izquierda -> Siguiente
    }
    if (touchEndX > touchStartX + threshold) {
        prevImage(); // Deslizar derecha -> Anterior
    }
}

// Cerrar lightbox haciendo clic en el fondo
document.getElementById('lightbox').addEventListener('click', function(event) {
    if (event.target === this) {
        closeLightbox();
    }
});
