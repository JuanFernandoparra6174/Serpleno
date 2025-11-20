/* =======================================================
   HOME — Cargar usuario + Carrusel
======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  loadHomeData();
});

async function loadHomeData() {
  const token = localStorage.getItem("token");
  if (!token) return (location.href = "/login.html");

  try {
    const res = await fetch("/home", {
      headers: { Authorization: "Bearer " + token }
    });

    const j = await res.json();

    if (!j.ok) return (location.href = "/login.html");

    // Nombre en el encabezado
    document.getElementById("welcome").textContent =
      "Hola " + (j.user.name || "") + ", bienvenido a Serpleno";

    // Segundo botón según plan
    setupSecondButton(j.user.plan);
    
    // Carrusel
    startCarousel(j.slides);

  } catch (e) {
    console.error(e);
    location.href = "/login.html";
  }
}

/* =======================================================
   BOTÓN SECUNDARIO
======================================================= */

function setupSecondButton(plan) {
  const btn = document.getElementById("secondBtn");
  plan = (plan || "gratuito").toLowerCase();

  if (plan === "gratuito") {
    btn.textContent = "Iniciar gratis";
    btn.href = "/content.html";
  } else {
    btn.textContent = "Ir a entrenamiento/cita";
    btn.href = "/schedule.html";
  }
}

/* =======================================================
   CARRUSEL FADE
======================================================= */

function startCarousel(slides) {
  const root = document.getElementById("fadeCarousel");
  const dotsC = root.querySelector(".carousel-dots");
  const prev = root.querySelector(".prev");
  const next = root.querySelector(".next");

  if (!slides || slides.length === 0) {
    slides = ["logo.png"];
  }

  // Crear elementos
  slides.forEach((name, i) => {
    const slide = document.createElement("div");
    slide.className = "fade-slide" + (i === 0 ? " active" : "");

    const img = document.createElement("img");
    img.className = "fade-img";
    img.src = "/assets/img/" + name;

    slide.appendChild(img);
    root.appendChild(slide);

    const dot = document.createElement("button");
    dot.className = "dot" + (i === 0 ? " active" : "");
    dot.addEventListener("click", () => go(i));
    dotsC.appendChild(dot);
  });

  let idx = 0;
  let timer = null;

  function go(n) {
    const slidesEls = root.querySelectorAll(".fade-slide");
    if (!slidesEls.length) return;

    slidesEls[idx].classList.remove("active");
    dotsC.querySelectorAll(".dot")[idx].classList.remove("active");

    idx = (n + slidesEls.length) % slidesEls.length;

    slidesEls[idx].classList.add("active");
    dotsC.querySelectorAll(".dot")[idx].classList.add("active");

    restart();
  }

  prev.addEventListener("click", () => go(idx - 1));
  next.addEventListener("click", () => go(idx + 1));

  function restart() {
    clearInterval(timer);
    timer = setInterval(() => go(idx + 1), 4000);
  }

  restart();
}
