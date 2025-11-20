/* =======================================================
   VALIDACIÓN DE TOKEN
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
const areaSelect = document.getElementById("areaSelect");
const proSelect = document.getElementById("proSelect");
const dateSelect = document.getElementById("dateSelect");
const hoursContainer = document.getElementById("hoursContainer");
const msgBox = document.getElementById("scheduleMsg");

/* =======================================================
   1. CARGAR TIPOS (ÁREAS)
======================================================= */
async function loadTypes() {
  const res = await fetch("/schedule/types", {
    headers: { Authorization: "Bearer " + token }
  });

  const j = await res.json();
  if (!j.ok) return;

  areaSelect.innerHTML = `<option value="">Selecciona...</option>`;
  j.types.forEach(t => {
    if (t)
      areaSelect.innerHTML += `<option value="${t}">${t}</option>`;
  });
}

/* =======================================================
   2. CARGAR PROFESIONALES SEGÚN ÁREA
======================================================= */
areaSelect.addEventListener("change", async () => {
  const area = areaSelect.value;
  proSelect.innerHTML = `<option>Cargando...</option>`;
  proSelect.disabled = true;
  dateSelect.disabled = true;
  hoursContainer.innerHTML = "";

  if (!area) return;

  const res = await fetch(`/schedule/professionals?type=${area}`, {
    headers: { Authorization: "Bearer " + token }
  });

  const j = await res.json();
  if (!j.ok) return;

  proSelect.innerHTML = `<option value="">Selecciona...</option>`;
  j.professionals.forEach(p => {
    proSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`;
  });

  proSelect.disabled = false;
});

/* =======================================================
   3. FECHA DISPONIBLE
======================================================= */
proSelect.addEventListener("change", () => {
  dateSelect.disabled = !proSelect.value;
  hoursContainer.innerHTML = "";
});

/* =======================================================
   4. OBTENER HORAS DISPONIBLES
======================================================= */
dateSelect.addEventListener("change", async () => {
  hoursContainer.innerHTML = "";

  const pro_id = proSelect.value;
  const date = dateSelect.value;

  if (!pro_id || !date) return;

  const res = await fetch(
    `/schedule/slots?pro_id=${pro_id}&date=${date}`,
    { headers: { Authorization: "Bearer " + token } }
  );

  const j = await res.json();
  if (!j.ok) return;

  if (j.slots.length === 0) {
    hoursContainer.innerHTML = `<p>No hay horarios disponibles.</p>`;
    return;
  }

  j.slots.forEach(s => {
    const btn = document.createElement("button");
    btn.className = "slot";
    btn.textContent = s.hour;

    btn.addEventListener("click", () => {
      bookAppointment(pro_id, date, s.hour);
    });

    hoursContainer.appendChild(btn);
  });
});

/* =======================================================
   5. AGENDAR CITA
======================================================= */
async function bookAppointment(pro_id, date, hour) {
  msgBox.style.display = "none";

  const res = await fetch("/schedule/book", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ pro_id, date, hour })
  });

  const j = await res.json();

  msgBox.style.display = "block";
  msgBox.className = "alert";

  if (!j.ok) {
    msgBox.classList.add("danger");
    msgBox.textContent = j.error || "No se pudo agendar.";
    return;
  }

  msgBox.classList.add("success");
  msgBox.textContent = j.message;

  // refrescar horas
  dateSelect.dispatchEvent(new Event("change"));
}

/* =======================================================
   INICIO
======================================================= */
loadTypes();
