import { apiFetch } from "./session.js";

document.addEventListener("DOMContentLoaded", loadMeeting);

async function loadMeeting() {
  const box = document.getElementById("meetingBox");

  try {
    const res = await apiFetch("/meeting");

    if (!res.ok) {
      box.innerHTML = `
        <div class="alert danger">
          ${res.error || "No tienes reuniones activas."}
        </div>
      `;

      if (res.redirect) {
        setTimeout(() => (window.location.href = res.redirect), 1500);
      }

      return;
    }

    const m = res.meeting;

    let video = "";
    if (m.meeting_url) {
      video = `
        <iframe
          class="meeting-video"
          src="${m.meeting_url}"
          allow="camera; microphone; fullscreen; speaker"
          allowfullscreen
        ></iframe>
      `;
    } else {
      video = `
        <p class="alert">El profesional aún no cargó el enlace de videollamada.</p>
      `;
    }

    box.innerHTML = `
      <h3>Reunión con ${m.professional}</h3>

      <p><strong>Especialidad:</strong> ${m.speciality}</p>

      <p>
        <strong>Fecha:</strong> ${m.date}<br>
        <strong>Hora:</strong> ${m.hour}
      </p>

      ${video}
    `;
  } catch (err) {
    console.error(err);
    box.innerHTML = `
      <div class="alert danger">
        Error cargando la reunión.
      </div>
    `;
  }
}
