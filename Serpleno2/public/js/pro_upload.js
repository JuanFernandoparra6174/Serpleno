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
const form = document.getElementById("uploadForm");
const msg = document.getElementById("msg");

/* =======================================================
   SUBIR CONTENIDO
======================================================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  msg.style.display = "none";

  const title = form.title.value.trim();
  const category = form.category.value;

  const filesInput = document.getElementById("filesInput");

  if (!filesInput.files.length) {
    showMsg("Selecciona al menos un archivo.", "danger");
    return;
  }

  const fd = new FormData();
  fd.append("title", title);
  fd.append("category", category);

  for (const file of filesInput.files) {
    fd.append("files", file);
  }

  try {
    const res = await fetch("/pro/upload", {
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

    showMsg(j.message || "Contenido subido exitosamente.", "success");

    // limpiar formulario
    form.reset();

  } catch (err) {
    showMsg("Error de conexión.", "danger");
  }
});

/* =======================================================
   UTIL
======================================================= */
function showMsg(text, type) {
  msg.textContent = text;
  msg.className = "alert " + type;
  msg.style.display = "block";
}
