/* =======================================================
   PORTAL — Cargar permisos según plan
======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  loadPortal();
});

async function loadPortal() {
  const token = localStorage.getItem("token");
  if (!token) return (location.href = "/login.html");

  try {
    const res = await fetch("/portal", {
      headers: { Authorization: "Bearer " + token }
    });

    const j = await res.json();

    if (!j.ok) {
      // Error o plan no permitido
      showRestricted(j.message || "Acceso restringido", j.redirect);
      return;
    }

    // Mostrar bienvenida
    document.getElementById("portalWelcome").textContent =
      "Bienvenido, " + (j.user.name || "");

    // Mostrar herramientas del dashboard
    renderTools(j.dashboard.access);

  } catch (e) {
    console.error(e);
    showRestricted("No se pudo conectar con el servidor");
  }
}

/* =======================================================
   Mostrar mensaje de restricción
======================================================= */

function showRestricted(msg, redirect = "/plans.html") {
  const box = document.getElementById("portalMsg");
  box.textContent = msg;
  box.style.display = "block";

  setTimeout(() => {
    location.href = redirect;
  }, 1800);
}

/* =======================================================
   Renderizar botones del portal
======================================================= */

function renderTools(permissions) {
  const wrap = document.getElementById("portalTools");

  let html = "";

  if (permissions.schedule)
    html += `<a class="btn primary" style="margin:8px; display:inline-block" href="/schedule.html">Agenda</a>`;

  if (permissions.content)
    html += `<a class="btn primary" style="margin:8px; display:inline-block" href="/content.html">Contenido</a>`;

  if (permissions.notifications)
    html += `<a class="btn primary" style="margin:8px; display:inline-block" href="/notifications.html">Notificaciones</a>`;

  if (permissions.payments)
    html += `<a class="btn primary" style="margin:8px; display:inline-block" href="/pay.html">Pagos</a>`;

  if (permissions.settings)
    html += `<a class="btn" style="margin:8px; display:inline-block" href="#">Configuración</a>`;

  wrap.innerHTML = html;
}
