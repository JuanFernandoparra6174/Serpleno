/* =======================================================
   AUTENTICACIÓN
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
const statsGrid = document.getElementById("statsGrid");

/* =======================================================
   CARGAR DATOS DEL PANEL
======================================================= */
async function loadAdminDashboard() {
  msg.style.display = "none";

  try {
    const res = await fetch("/admin/dashboard", {
      headers: { Authorization: "Bearer " + token }
    });

    const j = await res.json();

    if (!j.ok) {
      showMsg(j.error || "No se pudo cargar el panel.", "danger");
      return;
    }

    renderStats(j.stats);

  } catch (err) {
    showMsg("Error de conexión.", "danger");
  }
}

/* =======================================================
   RENDERIZAR ESTADÍSTICAS
======================================================= */
function renderStats(stats) {
  statsGrid.innerHTML = "";

  const items = [
    { label: "Usuarios Totales", value: stats.totalUsers },
    { label: "Profesionales", value: stats.totalProfessionals },
    { label: "Clientes", value: stats.totalClients },
    { label: "Administradores", value: stats.totalAdmins },
    { label: "Suscriptores Silver", value: stats.planSilver },
    { label: "Suscriptores Premium", value: stats.planPremium },
    { label: "Contenido Total", value: stats.totalContent }
  ];

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "stat-card";

    card.innerHTML = `
      <h3>${item.label}</h3>
      <p style="font-size:20px;font-weight:bold;">${item.value}</p>
    `;

    statsGrid.appendChild(card);
  });
}

/* =======================================================
   UTIL
======================================================= */
function showMsg(text, type) {
  msg.textContent = text;
  msg.className = "alert " + type;
  msg.style.display = "block";
}

/* =======================================================
   INICIO
======================================================= */
loadAdminDashboard();
