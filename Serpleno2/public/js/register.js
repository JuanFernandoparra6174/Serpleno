/* =======================================================
   REGISTER — Frontend
======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const msg = document.getElementById("regMsg");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    msg.style.display = "none";

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!name || !email || !password) {
      return showMsg("Completa todos los campos", true);
    }

    try {
      const res = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const j = await res.json();

      if (!j.ok) {
        return showMsg(j.error || "No se pudo registrar", true);
      }

      showMsg("Registro exitoso. Redirigiendo...", false);

      // Redirige al login
      setTimeout(() => {
        window.location.href = "/login.html";
      }, 1200);

    } catch (err) {
      showMsg("Error de conexión con el servidor", true);
    }
  });

  function showMsg(text, danger = false) {
    msg.textContent = text;
    msg.className = "alert " + (danger ? "danger" : "success");
    msg.style.display = "block";
  }
});
