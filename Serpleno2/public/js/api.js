/* ==========================================================
   API CLIENT — Funciones globales de frontend
   Manejan token, fetch y errores automáticamente
========================================================== */

function getToken() {
  return localStorage.getItem("token");
}

function clearSession() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}

/* ========== WRAPPERS ========== */

async function apiGet(url) {
  const token = getToken();

  const res = await fetch(url, {
    headers: {
      "Authorization": token ? "Bearer " + token : ""
    }
  });

  const json = await res.json();

  if (json.redirect === "/login" || res.status === 401) {
    clearSession();
    return;
  }

  return json;
}

async function apiPost(url, data = {}) {
  const token = getToken();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? "Bearer " + token : ""
    },
    body: JSON.stringify(data)
  });

  const json = await res.json();

  if (json.redirect === "/login" || res.status === 401) {
    clearSession();
    return;
  }

  return json;
}

async function apiDelete(url) {
  const token = getToken();

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      "Authorization": token ? "Bearer " + token : ""
    }
  });

  const json = await res.json();

  if (json.redirect === "/login" || res.status === 401) {
    clearSession();
    return;
  }

  return json;
}
