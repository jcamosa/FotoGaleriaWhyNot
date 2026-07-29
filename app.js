const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyp8BeuxuGXhtje9A2TTIfMFH9gnRv40M4Vb129SBiIxbs92tRli1LRe3zQkOkPW9Z81A/exec"; // Asegúrate de tener tu URL de Apps Script aquí
let weddingData = {};
let currentSection = "fotografa";

async function loadData() {
    const loader = document.getElementById("loader");
    try {
        const response = await fetch(SCRIPT_URL);
        weddingData = await response.json();
        loader.style.display = "none";
        renderSection(currentSection);
    } catch (error) {
        console.error("Error al cargar los archivos:", error);
        loader.innerHTML = "<p>Error al conectar con la galería. Comprueba la conexión.</p>";
    }
}

function renderSection(sectionKey) {
    const container = document.getElementById("gallery-container");
    container.innerHTML = "";
    
    const items = weddingData[sectionKey] || [];
    
    if (items.length === 0) {
        container.innerHTML = "<p style='grid-column: 1/-1; text-align: center; padding: 4rem; color: #777;'>No hay contenido en esta sección todavía.</p>";
        return;
    }

    items.forEach(item => {
        const div = document.createElement("div");
        div.className = "gallery-item";
        
        const mediaElement = document.createElement("img");
        // PRECARGA EN BAJA CALIDAD: Usamos `=s400` para que la miniatura pese poquísimo y cargue instantánea al hacer scroll
        mediaElement.src = item.lowQualityUrl || item.url;
        mediaElement.loading = "lazy";
        
        div.appendChild(mediaElement);

        if (item.type === "video") {
            const badge = document.createElement("div");
            badge.className = "video-badge";
            badge.innerText = "▶ Vídeo";
            div.appendChild(badge);
        }
        
        // Al hacer clic, abre el modal y carga la máxima calidad original
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
        // AQUÍ SE CARGA LA MÁXIMA CALIDAD SOLO AL PINCHAR
        content.src = item.originalUrl || item.url;
        modalContent.appendChild(content);
    } else {
        const content = document.createElement("video");
        content.src = item.originalUrl || item.url;
        content.controls = true;
        content.autoplay = true;
        content.playsInline = true;
        modalContent.appendChild(content);
    }
    
    downloadBtn.href = item.downloadUrl;
    modal.style.display = "flex";
}

// Cerrar modal
document.querySelector(".close-modal").addEventListener("click", () => {
    document.getElementById("media-modal").style.display = "none";
    stopVideos();
});

document.getElementById("media-modal").addEventListener("click", (e) => {
    if (e.target.id === "media-modal") {
        document.getElementById("media-modal").style.display = "none";
        stopVideos();
    }
});

function stopVideos() {
    document.querySelectorAll("#modal-content video").forEach(v => v.pause());
}

// Cambio de pestañas
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
