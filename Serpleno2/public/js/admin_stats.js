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
const statsGrid = document.getElementById("statsGrid");

/* =======================================================
   CARGAR ESTADÍSTICAS
======================================================= */
async function loadStats() {
  msg.style.display = "none";

  try {
    const res = await fetch("/admin/stats", {
      headers: { Authorization: "Bearer " + token }
    });

    const j = await res.json();

    if (!j.ok) {
      showMsg(j.error || "No se pudieron cargar las estadísticas.", "danger");
      return;
    }

    renderStats(j);

  } catch (err) {
    showMsg("Error de conexión.", "danger");
  }
}

/* =======================================================
   RENDERIZAR
======================================================= */
function renderStats({ users, content, appointments }) {
  statsGrid.innerHTML = "";

  /* ---------- TARJETA 1: USUARIOS ---------- */
  const usersCard = document.createElement("div");
  usersCard.className = "stat-box";
  usersCard.innerHTML = `
    <h3>Usuarios</h3>
    <p>Total: <strong>${users.totalUsers}</strong></p>
    <p>Profesionales: ${users.totalProfesionales}</p>
    <p>Clientes: ${users.totalClientes}</p>
    <p>Administradores: ${users.totalAdmins}</p>
    <p>Registrados hoy: ${users.todayUsers}</p>
    <p>Crecimiento últimos 30 días: ${users.growth30}</p>
  `;

  /* ---------- TARJETA 2: CONTENIDO ---------- */
  const contentCard = document.createElement("div");
  contentCard.className = "stat-box";

  const catList = Object.entries(content.byCategory)
    .map(([cat, num]) => `<li>${cat}: <strong>${num}</strong></li>`)
    .join("");

  contentCard.innerHTML = `
    <h3>Contenido</h3>
    <p>Total: <strong>${content.totalContent}</strong></p>
    <ul class="cat-list">${catList}</ul>
  `;

  /* ---------- TARJETA 3: CITAS ---------- */
  const appointmentsCard = document.createElement("div");
  appointmentsCard.className = "stat-box";

  const areaList = Object.entries(appointments.byArea)
    .map(([area, num]) => `<li>${area}: <strong>${num}</strong></li>`)
    .join("");

  appointmentsCard.innerHTML = `
    <h3>Citas y Reservas</h3>
    <p>Total: <strong>${appointments.total}</strong></p>
    <p>Citas hoy: ${appointments.today}</p>
    <ul class="area-list">${areaList}</ul>
  `;

  /* Agregar tarjetas al grid */
  statsGrid.appendChild(usersCard);
  statsGrid.appendChild(contentCard);
  statsGrid.appendChild(appointmentsCard);
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
   INIT
======================================================= */
loadStats();
