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
   FECHAS ACTUALES
======================================================= */
let currentMonth = new Date().getMonth() + 1;
let currentYear = new Date().getFullYear();

/* =======================================================
   ELEMENTOS
======================================================= */
const msg = document.getElementById("msg");
const grid = document.getElementById("calendarGrid");
const monthLabel = document.getElementById("monthLabel");

/* =======================================================
   CARGAR CALENDARIO
======================================================= */
async function loadCalendar() {
  msg.style.display = "none";

  try {
    const res = await fetch(`/pro/calendar?month=${currentMonth}&year=${currentYear}`, {
      headers: { Authorization: "Bearer " + token }
    });

    const j = await res.json();

    if (!j.ok) {
      return showMsg(j.error || "Error al cargar calendario", "danger");
    }

    renderCalendar(j.slots, j.reservations);

  } catch (err) {
    showMsg("Error de conexión.", "danger");
  }
}

/* =======================================================
   RENDERIZAR CALENDARIO
======================================================= */
function renderCalendar(slots, reservations) {
  grid.innerHTML = "";

  const days = new Date(currentYear, currentMonth, 0).getDate();

  const monthName = new Date(currentYear, currentMonth - 1)
    .toLocaleString("es-ES", { month: "long" });

  monthLabel.textContent = `${monthName.toUpperCase()} ${currentYear}`;

  for (let day = 1; day <= days; day++) {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const dayDiv = document.createElement("div");
    dayDiv.className = "day";

    dayDiv.innerHTML = `<div class="date">${day}</div>`;

    // slots disponibles
    slots
      .filter(s => s.date === dateStr)
      .forEach(s => {
        const slot = document.createElement("div");
        slot.className = "slot";
        slot.textContent = s.hour;

        if (s.status === "reserved") {
          slot.classList.add("busy");
        } else {
          slot.onclick = () => deleteSlot(s.id);
        }

        dayDiv.appendChild(slot);
      });

    grid.appendChild(dayDiv);
  }
}

/* =======================================================
   AGREGAR SLOT
======================================================= */
async function addSlot() {
  const date = document.getElementById("newDate").value;
  const hour = document.getElementById("newHour").value;

  if (!date || !hour) {
    showMsg("Selecciona fecha y hora.", "danger");
    return;
  }

  try {
    const res = await fetch("/pro/calendar/slot", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ date, hour })
    });

    const j = await res.json();

    if (!j.ok) {
      showMsg(j.error || "No se pudo agregar.", "danger");
      return;
    }

    showMsg("Disponibilidad agregada.", "success");
    loadCalendar();

  } catch (err) {
    showMsg("Error de conexión.", "danger");
  }
}

/* =======================================================
   ELIMINAR SLOT
======================================================= */
async function deleteSlot(id) {
  if (!confirm("¿Eliminar esta disponibilidad?")) return;

  try {
    const res = await fetch(`/pro/calendar/slot/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    });

    const j = await res.json();

    if (!j.ok) {
      showMsg(j.error || "No se pudo eliminar.", "danger");
      return;
    }

    showMsg("Disponibilidad eliminada.", "success");
    loadCalendar();

  } catch (err) {
    showMsg("Error de conexión.", "danger");
  }
}

/* =======================================================
   CAMBIO DE MES
======================================================= */
function nextMonth() {
  currentMonth++;
  if (currentMonth > 12) {
    currentMonth = 1;
    currentYear++;
  }
  loadCalendar();
}

function prevMonth() {
  currentMonth--;
  if (currentMonth < 1) {
    currentMonth = 12;
    currentYear--;
  }
  loadCalendar();
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
loadCalendar();
