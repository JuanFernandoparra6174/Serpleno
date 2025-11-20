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
const list = document.getElementById("noticesList");
const upgradeBox = document.getElementById("upgradeBox");
const upgradeMsg = document.getElementById("upgradeMsg");

/* =======================================================
   CARGAR NOTIFICACIONES
======================================================= */
async function loadNotifications() {
  const res = await fetch("/notifications", {
    headers: { Authorization: "Bearer " + token }
  });

  const j = await res.json();

  if (!j.ok) {
    list.innerHTML = `<p class="alert danger">${j.error || "No se pudo cargar"}</p>`;
    return;
  }

  renderNotifications(j.notices);

  if (j.upgradeRequired) {
    upgradeMsg.innerHTML = j.upgradeMessages.join("<br>");
    upgradeBox.style.display = "block";
  }
}

/* =======================================================
   MOSTRAR NOTIFICACIONES EN PANTALLA
======================================================= */
function renderNotifications(arr) {
  list.innerHTML = "";

  if (arr.length === 0) {
    list.innerHTML = `<p class="alert">No tienes notificaciones.</p>`;
    return;
  }

  arr.forEach(n => {
    const card = document.createElement("div");
    card.className = "notice-card";

    card.innerHTML = `
      <div class="notice-type">${n.type ? n.type.toUpperCase() : "General"}</div>
      <div>${n.msg}</div>
    `;

    list.appendChild(card);
  });
}

/* =======================================================
   INICIO
======================================================= */
loadNotifications();
