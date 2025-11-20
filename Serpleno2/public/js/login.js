/* =======================================================
   LOGIN — Frontend
======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const msg = document.getElementById("loginMsg");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    msg.style.display = "none";

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!email || !password) {
      showMsg("Todos los campos son obligatorios", true);
      return;
    }

    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const j = await res.json();

      if (!j.ok) {
        showMsg(j.error || "Credenciales incorrectas", true);
        return;
      }

      // Guardar token
      localStorage.setItem("token", j.token);

      // Redirección según el rol que devuelve el backend
      window.location.href = j.redirect || "/home.html";

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


