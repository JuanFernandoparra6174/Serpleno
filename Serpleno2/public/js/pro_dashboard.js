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
const welcome = document.getElementById("welcome");
const grid = document.getElementById("toolGrid");

/* =======================================================
   CARGAR DATOS DEL PANEL PROFESIONAL
======================================================= */
async function loadDashboard() {
  const res = await fetch("/pro/dashboard", {
    headers: { Authorization: "Bearer " + token }
  });

  const j = await res.json();

  if (!j.ok) {
    alert(j.error || "No autorizado.");
    return (location.href = "/home");
  }

  welcome.textContent = `Hola ${j.user.name}, administra tu contenido y agenda.`;

  renderTools(j.tools);
}

/* =======================================================
   RENDER DE ACCESOS
======================================================= */
function renderTools(tools) {
  grid.innerHTML = "";

  const list = [
    { key: "calendar", label: "Agenda Disponible", link: "/pro_calendar.html" },
    { key: "content", label: "Contenido Publicado", link: "/pro_content.html" },
    { key: "upload", label: "Subir Contenido", link: "/pro_upload.html" },
    { key: "notifications", label: "Notificaciones", link: "/pro_notifications.html" },
    { key: "clients", label: "Mis Clientes", link: "/schedule.html" },
    { key: "schedule", label: "Citas Reservadas", link: "/schedule.html" }
  ];

  list.forEach(t => {
    if (!tools[t.key]) return;

    const card = document.createElement("a");
    card.href = t.link;
    card.className = "tool-card";

    card.innerHTML = `
      <h3>${t.label}</h3>
      <p style="color:#666;font-size:14px;">Acceder</p>
    `;

    grid.appendChild(card);
  });
}

/* =======================================================
   INICIO
======================================================= */
loadDashboard();
