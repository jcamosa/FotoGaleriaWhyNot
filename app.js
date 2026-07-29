const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwb5KS2vddPydPb2h4IB5glzzBh7khR6CLs-cjdy2ywsFCZ37Kwr-gmrupqh15Z98MI/exec"; // Asegúrate de tener tu URL de Apps Script aquí
let weddingData = {};
let currentSection = "fotografa";

async function loadData() {
    try {
        const response = await fetch(SCRIPT_URL);
        weddingData = await response.json();
        renderSection(currentSection);
    } catch (error) {
        console.error("Error al cargar los archivos de Google Drive:", error);
    }
}

function renderSection(sectionKey) {
    const container = document.getElementById("gallery-container");
    container.innerHTML = "";
    
    const items = weddingData[sectionKey] || [];
    
    if (items.length === 0) {
        container.innerHTML = "<p style='grid-column: 1/-1; text-align: center; padding: 2rem;'>No hay contenido en esta sección todavía.</p>";
        return;
    }

    items.forEach(item => {
        const div = document.createElement("div");
        div.className = "gallery-item";
        
        if (item.type === "image") {
            const img = document.createElement("img");
            img.src = item.url;
            img.loading = "lazy";
            // Si una imagen falla al cargar en móvil, ocultamos el bloque para evitar errores visuales
            img.onerror = () => { div.style.display = 'none'; };
            div.appendChild(img);
        } else {
            // Para los vídeos, creamos una vista previa segura optimizada para móviles
            const videoPreview = document.createElement("div");
            videoPreview.className = "video-preview-container";
            videoPreview.innerHTML = `
                <img src="${item.url}" loading="lazy" onerror="this.src='https://via.placeholder.com/300?text=Vídeo'">
                <div class="play-icon">▶</div>
            `;
            div.appendChild(videoPreview);
        }
        
        // Evento al hacer clic para abrir el modal en grande
        div.addEventListener("click", () => openModal(item));
        
        container.appendChild(div);
    });
}

function openModal(item) {
    const modal = document.getElementById("media-modal");
    const modalContent = document.getElementById("modal-content");
    const downloadBtn = document.getElementById("modal-download");
    
    modalContent.innerHTML = "";
    
    if (item.type === "image") {
        const content = document.createElement("img");
        content.src = item.originalUrl || item.url;
        modalContent.appendChild(content);
    } else {
        const content = document.createElement("video");
        content.src = item.originalUrl || item.url;
        content.controls = true;
        content.autoplay = true;
        content.playsInline = true; // Vital para móviles (evita que se abra en pantalla completa forzada en iPhone)
        modalContent.appendChild(content);
    }
    
    downloadBtn.href = item.downloadUrl; 
    modal.style.display = "flex";
}

// Cerrar modal al hacer clic en la "X"
document.querySelector(".close-modal").addEventListener("click", () => {
    document.getElementById("media-modal").style.display = "none";
    stopVideos();
});

// Cerrar modal al hacer clic fuera del contenido
document.getElementById("media-modal").addEventListener("click", (e) => {
    if (e.target.id === "media-modal") {
        document.getElementById("media-modal").style.display = "none";
        stopVideos();
    }
});

function stopVideos() {
    document.querySelectorAll("#modal-content video").forEach(v => v.pause());
}

// Cambiar de sección mediante pestañas
document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        currentSection = e.target.getAttribute("data-section");
        renderSection(currentSection);
    });
});

// Botón de descarga general
document.getElementById("download-all-btn").addEventListener("click", () => {
    window.open("https://drive.google.com/drive/folders/1FqfWkqI71zRTqC4HkKRYWE39hkDtLecn", "_blank");
});

loadData();
