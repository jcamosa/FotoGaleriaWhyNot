const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx_GCCj0TNzcPQy1VOxyjxo76BAS5Pn2jNok6JBNV6nxYbTr13g3atUzIxDNipYbEHxWQ/exec";  
let weddingData = {};
let currentSection = "fotografa";

async function loadData() {
    const loader = document.getElementById("loader");
    try {
        const response = await fetch(SCRIPT_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        weddingData = await response.json();
        
        if (loader) loader.style.display = "none";
        renderSection(currentSection);
    } catch (error) {
        console.error("Detalle del error:", error);
        const container = document.getElementById("gallery-container");
        if (loader) loader.style.display = "none";
        container.innerHTML = `<p style='grid-column: 1/-1; text-align: center; padding: 4rem; color: #d9534f;'>Error al conectar con la galería. Comprueba que el Apps Script esté implementado como 'Cualquier usuario'.</p>`;
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
        // Usamos el endpoint de miniaturas oficial y seguro de Google Drive
        mediaElement.src = item.lowQualityUrl;
        mediaElement.loading = "lazy";
        
        mediaElement.onerror = () => {
            mediaElement.style.opacity = '0.2';
        };

        div.appendChild(mediaElement);

        if (item.type === "video") {
            const badge = document.createElement("div");
            badge.className = "video-badge";
            badge.innerText = "▶ Vídeo";
            div.appendChild(badge);
        }
        
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
        content.src = item.originalUrl;
        modalContent.appendChild(content);
    } else {
        const content = document.createElement("video");
        content.src = item.originalUrl;
        content.controls = true;
        content.autoplay = true;
        content.playsInline = true;
        modalContent.appendChild(content);
    }
    
    downloadBtn.href = item.downloadUrl;
    modal.style.display = "flex";
}

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

document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        currentSection = e.target.getAttribute("data-section");
        renderSection(currentSection);
    });
});

document.getElementById("download-all-btn").addEventListener("click", () => {
    window.open("https://drive.google.com/drive/folders/1FqfWkqI71zRTqC4HkKRYWE39hkDtLecn", "_blank");
});

loadData();
