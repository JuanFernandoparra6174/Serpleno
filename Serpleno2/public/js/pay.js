/* =======================================================
   PAY — Selección de método de pago y redirect externo
======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  loadPayInfo();
});

async function loadPayInfo() {
  const token = localStorage.getItem("token");
  if (!token) return (location.href = "/login");

  const params = new URLSearchParams(window.location.search);
  const plan = params.get("plan");
  const cycle = params.get("cycle") || "monthly";

  try {
    const res = await fetch(`/pay?plan=${plan}&cycle=${cycle}`, {
      headers: { Authorization: "Bearer " + token }
    });

    const j = await res.json();

    if (!j.ok) {
      return showError(j.error || "No se pudo cargar el pago");
    }

    renderPay(j);

  } catch (err) {
    showError("Error de conexión al cargar pago");
  }
}

/* =======================================================
   Renderizar pago
======================================================= */

function renderPay(j) {
  document.getElementById("payPlanTitle").textContent =
    "Pagar " + j.plan.charAt(0).toUpperCase() + j.plan.slice(1);

  const box = document.getElementById("payBox");

  box.innerHTML = `
    <h3>Confirmar compra</h3>

    <p style="font-size:18px;margin:10px 0;">
      <strong>Plan:</strong> ${j.plan.toUpperCase()}
      <br>
      <strong>Ciclo:</strong> ${j.cycle}
      <br>
      <strong>Precio:</strong> $${j.price}
    </p>

    <h4>Método de pago</h4>

    <div style="display:flex;flex-direction:column;gap:12px;margin-top:12px;">
      <button class="btn primary" onclick="goPay('${j.links.tarjeta}', '${j.plan}', '${j.cycle}', ${j.price}, 'tarjeta')">
        Tarjeta de crédito / débito
      </button>

      <button class="btn outline" onclick="goPay('${j.links.mercadopago}', '${j.plan}', '${j.cycle}', ${j.price}, 'mercadopago')">
        MercadoPago
      </button>
    </div>
  `;
}

/* =======================================================
   Ir a la pasarela
======================================================= */

function goPay(url, plan, cycle, amount, method) {
  const redirectUrl =
    `${url}?plan=${plan}&cycle=${cycle}&amt=${amount}&method=${method}`;

  window.location.href = redirectUrl;
}

/* =======================================================
   Error
======================================================= */

function showError(msg) {
  const box = document.getElementById("payMsg");
  box.textContent = msg;
  box.style.display = "block";
}
