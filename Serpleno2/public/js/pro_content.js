/* =======================================================
   VALIDAR TOKEN
======================================================= */
function requireAuth() {
  const token = localStorage.getItem("token");
  if (!token) location.href = "/login";
  return token;
}

const token = requireAuth();

/* =======================================================
   ELEMENTOS
======================================================= */
const grid = document.getElementById("contentGrid");
const msg = document.getElementById("msg");

/* =======================================================
   CARGAR CONTENIDO
======================================================= */
async function loadContent() {
  const res = await fetch("/pro/content", {
    headers: { Authorization: "Bearer " + token }
  });

  const j = await res.json();

  if (!j.ok) {
    msg.textContent = j.error || "No autorizado.";
    msg.className = "alert danger";
    msg.style.display = "block";
    return;
  }

  if (!j.content || j.content.length === 0) {
    grid.innerHTML = `<p style="color:#666;">Aún no has subido contenido.</p>`;
    return;
  }

  renderContent(j.content);
}

/* =======================================================
   RENDER
======================================================= */
function renderContent(items) {
  grid.innerHTML = "";

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "pro-card";

    let media = "";

    if (item.mime.startsWith("image/")) {
      media = `<img src="${item.filepath}" alt="${item.title}">`;
    } else if (item.mime === "video/mp4") {
      media = `
        <video controls>
          <source src="${item.filepath}" type="video/mp4">
        </video>
      `;
    } else if (item.mime === "application/pdf") {
      media = `<a class="btn outline" target="_blank" href="${item.filepath}">Abrir PDF</a>`;
    } else {
      media = `<a class="btn outline" target="_blank" href="${item.filepath}">Descargar archivo</a>`;
    }

    card.innerHTML = `
      <h3>${item.title}</h3>
      <p style="color:#666;margin:4px 0;">${item.category}</p>
      ${media}
    `;

    grid.appendChild(card);
  });
}

/* =======================================================
   INICIO
======================================================= */
loadContent();
