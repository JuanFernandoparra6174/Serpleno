/* =======================================================
   RESET PASSWORD — Frontend
======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resetForm");
  const msg = document.getElementById("resetMsg");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    msg.style.display = "none";

    const email = form.email.value.trim();

    if (!email) {
      return showMsg("Ingresa tu correo", true);
    }

    try {
      const res = await fetch("/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const j = await res.json();

      if (!j.ok) {
        return showMsg(j.error || "No se pudo enviar el correo", true);
      }

      showMsg("Se enviaron las instrucciones a tu correo.", false);

      setTimeout(() => {
        window.location.href = "/login.html";
      }, 1500);

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
