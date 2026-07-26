const SCRIPT_URL = "TU_URL_DE_WEB_APP_DE_APPS_SCRIPT";
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
        container.innerHTML = "<p style='grid-column: 1/-1; text-align: center;'>No hay contenido en esta sección todavía.</p>";
        return;
    }

    items.forEach(item => {
        const div = document.createElement("div");
        div.className = "gallery-item";
        
        let mediaElement;
        if (item.type === "image") {
            mediaElement = document.createElement("img");
            mediaElement.src = item.url;
            mediaElement.loading = "lazy";
        } else {
            mediaElement = document.createElement("video");
            mediaElement.src = item.url;
            mediaElement.muted = true;
        }

        div.appendChild(mediaElement);
        
        // Evento al hacer clic (en móvil o escritorio) abre el modal en grande
        div.addEventListener("click", () => openModal(item));
        
        container.appendChild(div);
    });
}

function openModal(item) {
    const modal = document.getElementById("media-modal");
    const modalContent = document.getElementById("modal-content");
    const downloadBtn = document.getElementById("modal-download");
    
    modalContent.innerHTML = "";
    let content;
    if (item.type === "image") {
        content = document.createElement("img");
        content.src = item.url;
    } else {
        content = document.createElement("video");
        content.src = item.url;
        content.controls = true;
        content.autoplay = true;
    }
    
    modalContent.appendChild(content);
    downloadBtn.href = item.downloadUrl; // Enlace directo a la máxima calidad de Drive
    modal.style.display = "flex";
}

// Cerrar modal
document.querySelector(".close-modal").addEventListener("click", () => {
    document.getElementById("media-modal").style.display = "none";
});

// Cambiar de sección mediante pestañas
document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        currentSection = e.target.getAttribute("data-section");
        renderSection(currentSection);
    });
});

// Botón de descarga general (comprimido o redirección a carpeta)
document.getElementById("download-all-btn").addEventListener("click", () => {
    window.open("https://drive.google.com/drive/folders/TU_ID_DE_CARPETA_RAIZ", "_blank");
});

loadData();