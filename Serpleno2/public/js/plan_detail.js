/* =======================================================
   PLAN DETAIL — Info + comparación + navegación al pago
======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  loadPlanDetail();
});

async function loadPlanDetail() {
  const params = new URLSearchParams(window.location.search);
  const plan = params.get("plan") || "gratuito";

  try {
    const res = await fetch("/plan/detail?plan=" + plan);
    const j = await res.json();

    if (!j.ok) {
      return showError(j.error || "No se pudo cargar el detalle del plan");
    }

    renderPlan(j.plan, j.alreadyHasPlan);

  } catch (err) {
    showError("Error de conexión con el servidor");
  }
}

/* =======================================================
   Renderizar el plan
======================================================= */

function renderPlan(plan, alreadyHasPlan) {
  document.getElementById("planTitle").textContent = plan.name;

  const box = document.getElementById("planDetailBox");
  box.innerHTML = "";

  let priceText = "";

  if (plan.price.monthly === 0) {
    priceText = `<p style="font-size:20px;font-weight:bold;">Gratis</p>`;
  } else {
    priceText = `
      <p style="font-size:20px;font-weight:bold;">
        $${plan.price.monthly} / mes
      </p>
      <p style="font-size:14px;color:#666">
        $${plan.price.yearly} / año
      </p>
    `;
  }

  const features = plan.features
    .map(f => `<li>• ${f}</li>`)
    .join("");

  const btn = alreadyHasPlan
    ? `<p style="color:#2f8d7e;margin-top:10px;font-weight:bold;">Ya tienes este plan</p>`
    : `<a class="btn primary" href="/pay.html?plan=${plan.key}">Elegir plan</a>`;

  box.innerHTML = `
    <div class="card" style="max-width:420px;">
      <h3 style="margin-top:0;">${plan.name}</h3>

      ${priceText}

      <h4 style="margin:12px 0 6px;">Beneficios</h4>

      <ul class="centered-list">
        ${features}
      </ul>

      <div style="margin-top:12px;">
        ${btn}
      </div>
    </div>
  `;
}

/* =======================================================
   Error
======================================================= */

function showError(msg) {
  const box = document.getElementById("planMsg");
  box.textContent = msg;
  box.style.display = "block";
}
