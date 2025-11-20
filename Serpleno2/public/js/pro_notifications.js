/* =======================================================
   TOKEN
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
const notifList = document.getElementById("notifList");
const filterSelect = document.getElementById("filterSelect");

/* =======================================================
   CARGAR NOTIFICACIONES
======================================================= */
async function loadNotifications() {
  msg.style.display = "none";

  const filter = filterSelect.value === "unread" ? "?filter=unread" : "";

  try {
    const res = await fetch("/pro/notifications" + filter, {
      headers: { Authorization: "Bearer " + token }
    });

    const j = await res.json();

    if (!j.ok) {
      showMsg(j.error || "No se pudieron cargar las notificaciones.", "danger");
      return;
    }

    renderNotifications(j.notifications);

  } catch (err) {
    showMsg("Error de conexión.", "danger");
  }
}

filterSelect.addEventListener("change", loadNotifications);


/* =======================================================
   RENDER
======================================================= */
function renderNotifications(list) {
  notifList.innerHTML = "";

  if (!list.length) {
    notifList.innerHTML = `<p style="text-align:center;color:#666;">No hay notificaciones.</p>`;
    return;
  }

  list.forEach(n => {
    const row = document.createElement("div");
    row.className = "notif-item " + (n.is_read ? "" : "unread");

    row.innerHTML = `
      <div>
        <strong>${n.title || "Notificación"}</strong><br>
        <small>${n.message || ""}</small><br>
        <small style="color:#777">${new Date(n.created_at).toLocaleString()}</small>
      </div>

      <div>
        ${
          n.is_read
            ? `<button onclick="markUnread(${n.id})">Marcar no leída</button>`
            : `<button onclick="markRead(${n.id})">Marcar leída</button>`
        }
      </div>
    `;

    notifList.appendChild(row);
  });
}


/* =======================================================
   MARCAR COMO LEÍDA / NO LEÍDA
======================================================= */
async function markRead(id) {
  try {
    const res = await fetch(`/pro/notifications/${id}/read`, {
      method: "POST",
      headers: { Authorization: "Bearer " + token }
    });

    const j = await res.json();

    if (j.ok) loadNotifications();
    else showMsg(j.error || "No se pudo marcar como leída", "danger");

  } catch (err) {
    showMsg("Error de conexión.", "danger");
  }
}

async function markUnread(id) {
  try {
    const res = await fetch(`/pro/notifications/${id}/unread`, {
      method: "POST",
      headers: { Authorization: "Bearer " + token }
    });

    const j = await res.json();

    if (j.ok) loadNotifications();
    else showMsg(j.error || "No se pudo marcar como no leída", "danger");

  } catch (err) {
    showMsg("Error de conexión.", "danger");
  }
}


/* =======================================================
   UTIL
======================================================= */
function showMsg(text, type) {
  msg.textContent = text;
  msg.className = "alert " + type;
  msg.style.display = "block";
}

loadNotifications();
