/* ==========================================================
   SPLASH REDIRECTOR
   Detecta token, valida sesión y redirige por rol
========================================================== */

async function initSplash() {
  const token = localStorage.getItem("token");

  // Sin token → mostrar splash y luego login
  if (!token) {
    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
    return;
  }

  try {
    // El endpoint correcto es /home (NO /auth/me)
    const res = await fetch("/home", {
      headers: { "Authorization": "Bearer " + token }
    });

    const json = await res.json();

    // Token inválido o expirado → limpiar y enviar a login
    if (!json.ok || !json.user) {
      localStorage.removeItem("token");
      setTimeout(() => {
        window.location.href = "/login";
      }, 800);
      return;
    }

    const role = (json.user.role || "").toLowerCase();

    // Redirecciones reales por rol
    if (role === "admin") {
      return window.location.href = "/admin/dashboard";
    }

    if (role === "profesional" || role === "pro") {
      return window.location.href = "/pro/dashboard";
    }

    return window.location.href = "/home";

  } catch (e) {
    console.error("Error en splash redirect:", e);
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
}

initSplash();

