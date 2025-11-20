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
const usersBody = document.getElementById("usersBody");
const searchInput = document.getElementById("searchInput");

/* =======================================================
   CARGAR LISTA DE USUARIOS
======================================================= */
async function loadUsers() {
  msg.style.display = "none";

  const q = searchInput.value.trim();

  const url = q
    ? `/admin/users?search=${encodeURIComponent(q)}`
    : `/admin/users`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: "Bearer " + token }
    });

    const j = await res.json();

    if (!j.ok) {
      showMsg(j.error || "Error cargando usuarios.", "danger");
      return;
    }

    renderUsers(j.users);

  } catch (err) {
    showMsg("Error de conexión.", "danger");
  }
}

searchInput.addEventListener("input", loadUsers);

/* =======================================================
   RENDER USUARIOS
======================================================= */
function renderUsers(list) {
  usersBody.innerHTML = "";

  if (!list.length) {
    usersBody.innerHTML = `
      <tr><td colspan="6" style="text-align:center;color:#777">No hay usuarios.</td></tr>
    `;
    return;
  }

  list.forEach(u => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>
        <select 
          onchange="updateRole(${u.id}, this.value)" 
          style="padding:5px;border-radius:6px;"
        >
          <option value="cliente" ${u.role === "cliente" ? "selected" : ""}>Cliente</option>
          <option value="profesional" ${u.role === "profesional" ? "selected" : ""}>Profesional</option>
          <option value="admin" ${u.role === "admin" ? "selected" : ""}>Administrador</option>
        </select>
      </td>
      <td>${u.plan || "-"}</td>

      <td class="actions">
        <button class="danger-btn" onclick="deleteUser(${u.id})">Eliminar</button>
      </td>
    `;

    usersBody.appendChild(tr);
  });
}

/* =======================================================
   ACTUALIZAR ROL
======================================================= */
async function updateRole(id, role) {
  try {
    const res = await fetch("/admin/users/update-role", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ id, role })
    });

    const j = await res.json();

    if (!j.ok) {
      showMsg(j.error || "No se pudo actualizar el rol.", "danger");
      return;
    }

    showMsg("Rol actualizado correctamente.", "success");

  } catch (err) {
    showMsg("Error de conexión.", "danger");
  }
}

/* =======================================================
   ELIMINAR USUARIO
======================================================= */
async function deleteUser(id) {
  if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

  try {
    const res = await fetch(`/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    });

    const j = await res.json();

    if (!j.ok) {
      showMsg(j.error || "No se pudo eliminar usuario.", "danger");
      return;
    }

    showMsg("Usuario eliminado.", "success");
    loadUsers();

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

/* =======================================================
   INICIO
======================================================= */
loadUsers();
