/* =======================================================
   NAVBAR — Control de sesión, usuario y rutas
======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
});

async function initNavbar() {
  const nav = document.getElementById("navLinks");
  if (!nav) return;

  const token = localStorage.getItem("token");

  // No hay token → solo mostrar login y registro
  if (!token) {
    nav.innerHTML = `
      <li><a href="/login.html">Ingresar</a></li>
      <li><a href="/register.html">Crear cuenta</a></li>
    `;
    return;
  }

  // Obtener usuario
  const user = await getUser();
  if (!user) {
    nav.innerHTML = `
      <li><a href="/login.html">Ingresar</a></li>
    `;
    return;
  }

  /* =======================================================
     ENLACES POR ROL
  ======================================================== */

  const role = user.role;
  const plan = user.plan || "gratuito";

  let html = `
    <li><a href="/home.html">Inicio</a></li>
    <li><a href="/content.html">Contenido</a></li>
  `;

  // Portal premium / estudiantil
  if (["premium", "silver", "estudiantil"].includes(plan.toLowerCase())) {
    html += `<li><a href="/portal.html">Portal</a></li>`;
  }

  // Profesionales
  if (role === "profesional") {
    html += `
      <li><a href="/pro-dashboard.html">Panel Pro</a></li>
      <li><a href="/pro-calendar.html">Calendario</a></li>
      <li><a href="/pro-content.html">Mis Contenidos</a></li>
    `;
  }

  // Admin
  if (role === "admin") {
    html += `
      <li><a href="/admin-dashboard.html">Admin</a></li>
      <li><a href="/admin-users.html">Usuarios</a></li>
      <li><a href="/admin-content.html">Contenido</a></li>
      <li><a href="/admin-stats.html">Estadísticas</a></li>
    `;
  }

  // Logout
  html += `
    <li><a href="#" id="logoutBtn" style="color:#f55;font-weight:bold">Salir</a></li>
  `;

  nav.innerHTML = html;

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
  });
}

/* =======================================================
   Obtener usuario desde /auth/me
======================================================= */

async function getUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const res = await fetch("/auth/me", {
      headers: { Authorization: "Bearer " + token }
    });

    const j = await res.json();
    return j.ok ? j.user : null;

  } catch {
    return null;
  }
}
