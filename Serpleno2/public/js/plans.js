/* =======================================================
   PLANS — Mostrar todos los planes desde la API
======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  loadPlans();
});

async function loadPlans() {
  try {
    const res = await fetch("/plans");
    const j = await res.json();

    if (!j.ok) {
      return showPlansError(j.error || "No se pudieron cargar los planes");
    }

    renderPlans(j);

  } catch (err) {
    showPlansError("Error de conexión con el servidor");
  }
}

/* =======================================================
   Renderizar plan cards
======================================================= */

function renderPlans(data) {
  const grid = document.getElementById("plansGrid");
  grid.innerHTML = "";

  const { planNames, prices, featuresByPlan } = data;

  const keys = Object.keys(planNames); // ["gratuito", "silver", "premium"]

  keys.forEach(key => {
    const card = document.createElement("div");
    card.className = "plan-card plan-" + key;

    const title = `<h3>${planNames[key]}</h3>`;

    const price = prices[key].monthly === 0
      ? `<p style="font-size:18px;font-weight:bold;">Gratis</p>`
      : `<p style="font-size:18px;font-weight:bold;">$${prices[key].monthly} / mes</p>`;

    const features = featuresByPlan[key]
      .map(f => `<li>• ${f}</li>`)
      .join("");

    const btn = `
      <a class="btn primary" style="margin-top:10px" 
         href="/plan_detail.html?plan=${key}">
        Ver detalles
      </a>
    `;

    card.innerHTML = `
      ${title}
      ${price}
      <ul class="features">${features}</ul>
      ${btn}
    `;

    grid.appendChild(card);
  });
}

/* =======================================================
   Error
======================================================= */
function showPlansError(msg) {
  const box = document.getElementById("plansMsg");
  box.textContent = msg;
  box.style.display = "block";
}
