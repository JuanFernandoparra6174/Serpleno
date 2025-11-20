/* =======================================================
   AUTH
======================================================= */
function auth() {
  const token = localStorage.getItem("token");
  if (!token) location.href = "/login";
  return token;
}
const token = auth();

/* =======================================================
   ELEMENTOS
======================================================= */
const msg = document.getElementById("msg");
const grid = document.getElementById("contentGrid");
const form = document.getElementById("contentForm");

/* =======================================================
   CARGAR CONTENIDO
======================================================= */
async function loadContent() {
  msg.style.display = "none";

  try {
    const res = await fetch("/admin/content", {
      headers: { Authorization: "Bearer " + token }
    });

    const j = await res.json();

    if (!j.ok) {
      showMsg(j.error || "No se pudo cargar el contenido.", "danger");
      return;
    }

    renderContent(j.contents);

  } catch (err) {
    showMsg("Error de conexión.", "danger");
  }
}

/* =======================================================
   RENDER LISTA
======================================================= */
function renderContent(list) {
  grid.innerHTML = "";

  if (!list.length) {
    grid.innerHTML = `<p style="grid-column:1/-1;color:#777">No hay contenido disponible.</p>`;
    return;
  }

  list.forEach(c => {
    const card = document.createElement("div");
    card.className = "c-card";

    let media = "";

    if (c.mime?.startsWith("image/")) {
      media = `<img src="${c.filepath}" alt="">`;
    } else if (c.mime === "video/mp4") {
      media = `<video controls><source src="${c.filepath}" type="video/mp4"></video>`;
    } else if (c.mime === "application/pdf") {
      media = `<a class="btn outline" href="${c.filepath}" target="_blank">Abrir PDF</a>`;
    } else {
      media = `<a class="btn outline" href="${c.filepath}" target="_blank">Descargar archivo</a>`;
    }

    card.innerHTML = `
      ${media}
      <h4>${c.title}</h4>
      <p style="color:#777">${c.category}</p>
      <button class="btn danger" onclick="deleteContent(${c.id})">Eliminar</button>
    `;

    grid.appendChild(card);
  });
}

/* =======================================================
   SUBIR CONTENIDO
======================================================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  msg.style.display = "none";

  const fd = new FormData(form);

  try {
    const res = await fetch("/admin/content", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token
      },
      body: fd
    });

    const j = await res.json();

    if (!j.ok) {
      showMsg(j.error || "No se pudo subir el contenido.", "danger");
      return;
    }

    showMsg("Contenido creado correctamente.", "success");
    form.reset();
    loadContent();

  } catch (err) {
    showMsg("Error de conexión.", "danger");
  }
});

/* =======================================================
   ELIMINAR CONTENIDO
======================================================= */
async function deleteContent(id) {
  if (!confirm("¿Seguro que deseas eliminar este contenido?")) return;

  try {
    const res = await fetch(`/admin/content/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    });

    const j = await res.json();

    if (!j.ok) {
      showMsg(j.error || "No se pudo eliminar.", "danger");
      return;
    }

    showMsg("Contenido eliminado.", "success");
    loadContent();

  } catch (err) {
    showMsg("Error de conexión.", "danger");
  }
}

/* =======================================================
   UTIL
======================================================= */
function showMsg(text, type) {
  msg.style.display = "block";
  msg.textContent = text;
  msg.className = "alert " + type;
}

/* =======================================================
   INIT
======================================================= */
loadContent();
