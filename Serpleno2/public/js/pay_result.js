/* =======================================================
   Resultado de pago — procesa queryString
======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  loadResult();
});

async function loadResult() {
  const token = localStorage.getItem("token");
  if (!token) return (location.href = "/login");

  const params = new URLSearchParams(window.location.search);
  const ok = params.get("ok") || "0";
  const plan = params.get("plan") || "";
  const cycle = params.get("cycle") || "";
  const amount = params.get("amt") || "0";
  const method = params.get("method") || "";

  try {
    const res = await fetch(
      `/pay/result?ok=${ok}&plan=${plan}&cycle=${cycle}&amt=${amount}&method=${method}`,
      { headers: { Authorization: "Bearer " + token } }
    );

    const j = await res.json();

    if (!j.ok) {
      showError("No se pudo procesar el resultado del pago");
      return;
    }

    renderResult(j);

  } catch (err) {
    showError("Error de conexión.");
  }
}

/* =======================================================
   Mostrar resultado en pantalla
======================================================= */

function renderResult(j) {
  const box = document.getElementById("resultBox");

  if (j.payment_success) {
    box.innerHTML = `
      <h3 style="color:#2f8d7e;">¡Pago exitoso!</h3>
      <p>Tu plan ha sido actualizado a <strong>${j.plan_name}</strong>.</p>

      <p>
        <strong>Método:</strong> ${j.method} <br>
        <strong>Ciclo:</strong> ${j.cycle} <br>
        <strong>Valor pagado:</strong> $${j.amount}
      </p>

      <p style="margin-top:12px;">
        Ya puedes acceder a todo tu contenido.
      </p>
    `;
  } else {
    box.innerHTML = `
      <h3 style="color:#c0392b;">Pago fallido</h3>

      <p>Tu pago no pudo ser procesado.</p>

      <p>
        <strong>Método:</strong> ${j.method} <br>
        <strong>Ciclo:</strong> ${j.cycle} <br>
        <strong>Monto:</strong> $${j.amount}
      </p>

      <p style="margin-top:12px;">
        Por favor intenta nuevamente.
      </p>

      <a href="/plans" class="btn primary" style="display:inline-block;margin-top:10px;">
        Volver a los planes
      </a>
    `;
  }
}

/* =======================================================
   Error
======================================================= */

function showError(msg) {
  const box = document.getElementById("resultBox");
  box.innerHTML = `
    <h3 style="color:#c0392b;">Error</h3>
    <p>${msg}</p>
  `;
}
