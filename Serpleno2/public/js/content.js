/* =======================================================
   CONTENT — Filtros + Render dinámico desde API
======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  loadContent();
  setupCategoryChips();
});

let FULL_CONTENT = [];

/* =======================================================
   Cargar contenido desde backend
======================================================= */
async function loadContent() {
  const token = localStorage.getItem("token");
  if (!token) return (location.href = "/login.html");

  try {
    const res = await fetch("/content", {
      headers: { Authorization: "Bearer " + token }
    });

    const j = await res.json();

    if (!j.ok) {
      return showError(j.error || "No se pudo cargar el contenido");
    }

    FULL_CONTENT = j.content || [];
    renderContent("all");

  } catch (err) {
    showError("Error de conexión con el servidor");
  }
}

/* =======================================================
   Renderizar tarjetas de contenido
======================================================= */
function renderContent(category) {
  const grid = document.getElementById("contentGrid");
  grid.innerHTML = "";

  let items = FULL_CONTENT;

  if (category !== "all") {
    items = items.filter(c => c.category === category);
  }

  if (items.length === 0) {
    grid.innerHTML = `<p style="text-align:center;color:#666;">No hay contenido disponible.</p>`;
    return;
  }

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.maxWidth = "320px";

    const title = `<h3 style="margin-top:0;margin-bottom:8px;">${item.title}</h3>`;
    const sub = `<p style="color:#666;margin:0 0 8px;">${item.category} • Día ${item.day || "—"}</p>`;

    let media = "";

    if (item.mime && item.mime.startsWith("image/")) {
      media = `<img src="${item.filepath}" style="width:100%;border-radius:8px;" />`;

    } else if (item.mime === "video/mp4") {
      media = `
        <video controls style="width:100%;border-radius:8px;">
          <source src="${item.filepath}" type="video/mp4" />
        </video>
      `;

    } else if (item.mime === "application/pdf") {
      media = `<a class="btn outline" target="_blank" href="${item.filepath}">Abrir PDF</a>`;

    } else {
      media = `<a class="btn outline" target="_blank" href="${item.filepath}">Descargar archivo</a>`;
    }

    card.innerHTML = title + sub + media;
    grid.appendChild(card);
  });
}

/* =======================================================
   Chips de categorías (filtros)
======================================================= */
function setupCategoryChips() {
  const chips = document.querySelectorAll(".chip");

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");

      const category = chip.dataset.cat;
      renderContent(category);
    });
  });
}

/* =======================================================
   Mostrar error
======================================================= */
function showError(msg) {
  const box = document.getElementById("contentMsg");
  box.textContent = msg;
  box.style.display = "block";
}
