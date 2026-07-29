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
        container.innerHTML = "<p style='grid-column: 1/-1; text-align: center;'>No hay contenido en esta sección todavía.</p>";
        return;
    }

    items.forEach(item => {
        const div = document.createElement("div");
        div.className = "gallery-item";
        
        let mediaElement;
        if (item.type === "image") {
            mediaElement = document.createElement("img");
            // Usa la versión optimizada a 800px para una carga ultra rápida en móvil y PC
            mediaElement.src = item.url;
            mediaElement.loading = "lazy"; // Carga perezosa nativa del navegador
        } else {
            mediaElement = document.createElement("video");
            mediaElement.src = item.url;
            mediaElement.muted = true;
        }

        div.appendChild(mediaElement);
        
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
    let content;
    if (item.type === "image") {
        content = document.createElement("img");
        // Al ampliar en el modal, cargamos la imagen en su resolución original y máxima calidad
        content.src = item.originalUrl || item.url;
    } else {
        content = document.createElement("video");
        content.src = item.originalUrl || item.url;
        content.controls = true;
        content.autoplay = true;
    }
    
    modalContent.appendChild(content);
    downloadBtn.href = item.downloadUrl; // Enlace directo a la descarga sin pérdida
    modal.style.display = "flex";
}

// Cerrar modal al hacer clic en la "X"
document.querySelector(".close-modal").addEventListener("click", () => {
    document.getElementById("media-modal").style.display = "none";
});

// Cerrar modal también si se hace clic fuera del contenido
document.getElementById("media-modal").addEventListener("click", (e) => {
    if (e.target.id === "media-modal") {
        document.getElementById("media-modal").style.display = "none";
    }
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

// Botón de descarga general (redirige a la carpeta raíz o de selección)
document.getElementById("download-all-btn").addEventListener("click", () => {
    window.open("https://drive.google.com/drive/folders/1FqfWkqI71zRTqC4HkKRYWE39hkDtLecn", "_blank");
});

loadData();
