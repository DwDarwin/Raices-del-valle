// Animaciones compartidas: se aplican sobre las clases que ya existen en cada página,
// sin tocar el HTML. Si algo falla, la página se ve igual que antes.

const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const conMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const FRASES_CINTA = [
  "Pago justo",
  "Cultivo campesino",
  "Del Valle de Sibundoy a tu mesa",
  "Sin intermediarios",
  "Tres generaciones de tierra",
];

// Donde se coloca la cinta de valores (justo antes de estas secciones)
const SECCIONES_CINTA = [".metrics-section", ".finca-method"];

if (!reducirMovimiento && "IntersectionObserver" in window) {
  if (hayQueMostrarBienvenida()) {
    mostrarBienvenida(iniciarTodo);
  } else {
    iniciarTodo();
  }
}

function iniciarTodo() {
  document.documentElement.classList.add("js-anim");
  iniciarAnimaciones();
  insertarCintas();
  crearHojas();
}

/* ---------- Pantalla de bienvenida (una vez por visita) ---------- */

function hayQueMostrarBienvenida() {
  try {
    if (sessionStorage.getItem("rdv:bienvenida")) return false;
    sessionStorage.setItem("rdv:bienvenida", "1");
    return true;
  } catch {
    return false;
  }
}

function mostrarBienvenida(alTerminar) {
  const pantalla = document.createElement("div");
  pantalla.className = "bienvenida";
  pantalla.setAttribute("aria-hidden", "true");
  pantalla.innerHTML = `
    <div class="bienvenida-logo">
      <svg viewBox="0 0 32 32" width="72" height="72" fill="none">
        <circle class="bienvenida-circulo" cx="16" cy="16" r="15" />
        <path class="bienvenida-hoja" d="M10 22c0-7 5-12 12-12 0 7-5 12-12 12zm0 0l7-7" />
      </svg>
      <span class="bienvenida-texto">Raíces<small>DEL VALLE</small></span>
    </div>`;
  document.body.appendChild(pantalla);

  setTimeout(() => {
    pantalla.classList.add("salir");
    alTerminar(); // las animaciones de la página arrancan mientras la pantalla se desvanece
    setTimeout(() => pantalla.remove(), 700);
  }, 1300);
}

/* ---------- Cifras que cuentan ---------- */

// Cuenta de 0 al valor final en cifras como "100%", "12 km", "1997"
function contarNumero(el) {
  const original = el.textContent;
  const numero = /\d+/.exec(original);
  if (!numero) return;

  const prefijo = original.slice(0, numero.index);
  const sufijo = original.slice(numero.index + numero[0].length);
  const final = Number(numero[0]);
  if (final === 0) return;

  // Los años (1997) cuentan desde cerca, para que no recorran miles de números
  const inicio = final >= 1900 && final <= 2100 ? final - 40 : 0;
  const duracion = 1600;
  const t0 = performance.now();

  function paso(ahora) {
    const avance = Math.min((ahora - t0) / duracion, 1);
    const suave = 1 - Math.pow(1 - avance, 3); // frena al final
    el.textContent = prefijo + Math.round(inicio + (final - inicio) * suave) + sufijo;
    if (avance < 1) requestAnimationFrame(paso);
    else el.textContent = original;
  }

  requestAnimationFrame(paso);
}

/* ---------- Títulos del hero: palabra por palabra ---------- */

function dividirTitulos() {
  document.querySelectorAll(".banner-title, .hero-title, .sec-title").forEach((titulo) => {
    if (titulo.classList.contains("split-title")) return;

    const recorrido = document.createTreeWalker(titulo, NodeFilter.SHOW_TEXT);
    const textos = [];
    while (recorrido.nextNode()) textos.push(recorrido.currentNode);

    let indice = 0;
    textos.forEach((texto) => {
      if (!/\S/.test(texto.textContent)) return;
      const fragmento = document.createDocumentFragment();
      texto.textContent.split(/(\s+)/).forEach((trozo) => {
        if (!trozo) return;
        if (/^\s+$/.test(trozo)) {
          fragmento.appendChild(document.createTextNode(trozo));
          return;
        }
        const palabra = document.createElement("span");
        palabra.className = "w";
        palabra.style.setProperty("--i", indice++);
        const interior = document.createElement("span");
        interior.textContent = trozo;
        palabra.appendChild(interior);
        fragmento.appendChild(palabra);
      });
      texto.replaceWith(fragmento);
    });

    titulo.classList.add("split-title");
    requestAnimationFrame(() =>
      requestAnimationFrame(() => titulo.classList.add("split-in"))
    );
  });
}

/* ---------- Cinta animada de valores ---------- */

function insertarCintas() {
  SECCIONES_CINTA.forEach((selector) => {
    const seccion = document.querySelector(selector);
    if (!seccion) return;

    const grupo = FRASES_CINTA.map((frase) => `<span>${frase}</span>`).join("");
    const cinta = document.createElement("div");
    cinta.className = "cinta";
    cinta.setAttribute("aria-hidden", "true");
    cinta.innerHTML = `<div class="cinta-pista">${grupo.repeat(4)}</div>`;
    seccion.before(cinta);
  });
}

/* ---------- Hojas que caen ---------- */

function crearHojas() {
  const colores = ["#2f6b4b", "#e6a73d", "#a85736", "#4f8f66"];
  const capa = document.createElement("div");
  capa.className = "hojas";
  capa.setAttribute("aria-hidden", "true");

  for (let i = 0; i < 8; i++) {
    const duracion = 24 + Math.random() * 16;
    const tamano = 16 + Math.random() * 16;
    const hoja = document.createElement("span");
    hoja.className = "hoja";
    hoja.style.left = `${6 + Math.random() * 88}%`;
    hoja.style.width = `${tamano}px`;
    hoja.style.height = `${tamano}px`;
    hoja.style.animationDuration = `${duracion}s`;
    hoja.style.animationDelay = `-${Math.random() * duracion}s`;
    hoja.innerHTML = `
      <svg viewBox="0 0 32 32" style="animation-delay:-${Math.random() * 6}s">
        <path d="M10 22c0-7 5-12 12-12 0 7-5 12-12 12z" fill="${colores[i % colores.length]}" />
        <path d="M10 22l7-7" stroke="#ffffff" stroke-opacity=".5" stroke-width="1.4" stroke-linecap="round" />
      </svg>`;
    capa.appendChild(hoja);
  }

  document.body.appendChild(capa);
}

/* ---------- Animaciones principales ---------- */

function iniciarAnimaciones() {
  dividirTitulos();

  // Elementos que aparecen subiendo
  const GRUPOS_FADE = [
    // Textos de cabecera de cada hero (se escalonan entre sí)
    ".hero-wrapper > *:not(.hero-badge)",
    ".hero-content > *",
    ".finca-hero-wrapper > *",
    ".mercado-header > *",
    ".contact-info > *",
    // Bloques de texto de cada sección
    ".finca-story-text > *",
    ".finca-method-content > *",
    ".about-content > *",
    ".tech-text > *",
    ".code-content > *",
    ".team-header > *",
    ".products-header > *",
    // Tarjetas y bloques
    ".feature-item",
    ".metric-item",
    ".finca-stat",
    ".finca-gallery-item",
    ".team-card",
    ".about-badge",
    ".circle-img",
    ".form-card",
    ".info-list > *",
    // Productos (se generan con JS)
    "#products-grid-container > *",
    "#productsGrid > *",
    // Títulos sueltos (al final, para no animar dos veces lo que ya está dentro de un bloque)
    ".finca-quote",
    "main h2",
    ".subtitle",
  ];

  // Fotos que se descubren como cortina
  const GRUPOS_FOTO = [".about-img", ".finca-method-img img"];

  // Tarjetas que se inclinan con el mouse
  const GRUPOS_TILT = [".team-card", ".product-card", ".finca-gallery-item"];

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        // Las fotos con cortina se observan por su contenedor (recortadas no cuentan como visibles)
        if (entrada.target.hasAttribute("data-anim-foto")) {
          entrada.target.querySelectorAll(".reveal-img").forEach((foto) => foto.classList.add("in"));
        } else {
          entrada.target.classList.add("in");
        }
        observador.unobserve(entrada.target);
        if (entrada.target.matches(".metric-number, .finca-stat-number")) {
          contarNumero(entrada.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
  );

  function preparar(raiz = document) {
    // Escalona (delay) los hermanos que aparecen juntos
    const hermanosVistos = new Map();

    const marcar = (el, clase) => {
      if (el.classList.contains("reveal") || el.classList.contains("reveal-img")) return;
      if (el.classList.contains("split-title")) return; // los títulos tienen su propia animación
      const padre = el.parentElement;
      // Si ya está dentro de algo que se anima, no se anima otra vez
      if (padre?.closest(".reveal")) return;
      const indice = hermanosVistos.get(padre) ?? 0;
      hermanosVistos.set(padre, indice + 1);
      el.style.setProperty("--d", `${Math.min(indice, 6) * 110}ms`);
      el.classList.add(clase);
      if (clase === "reveal-img" && padre) {
        padre.setAttribute("data-anim-foto", "");
        observador.observe(padre);
      } else {
        observador.observe(el);
      }
    };

    GRUPOS_FADE.forEach((selector) =>
      raiz.querySelectorAll(selector).forEach((el) => marcar(el, "reveal"))
    );
    GRUPOS_FOTO.forEach((selector) =>
      raiz.querySelectorAll(selector).forEach((el) => marcar(el, "reveal-img"))
    );

    // Las cifras solo necesitan saber cuándo se ven, para contar
    raiz
      .querySelectorAll(".metric-number, .finca-stat-number")
      .forEach((el) => observador.observe(el));

    if (conMouse) prepararTilt(raiz, GRUPOS_TILT);
  }

  iniciarScroll();
  if (conMouse) iniciarTilt();

  preparar();

  // El header/footer y los productos se cargan con JS: se animan cuando aparecen.
  // Se observan solo los contenedores de productos, para no repetir animaciones en otros cambios.
  ["products-grid-container", "productsGrid"].forEach((id) => {
    const contenedor = document.getElementById(id);
    if (!contenedor) return;
    new MutationObserver(() => preparar(contenedor.parentElement || document)).observe(
      contenedor,
      { childList: true }
    );
  });
}

/* ---------- Scroll: barra de progreso, parallax y botón de subir ---------- */

function iniciarScroll() {
  const barra = document.createElement("div");
  barra.className = "scroll-progress";
  barra.setAttribute("aria-hidden", "true");
  document.body.appendChild(barra);

  const LARGO_ANILLO = 2 * Math.PI * 21;
  const subir = document.createElement("button");
  subir.type = "button";
  subir.className = "volver-arriba";
  subir.setAttribute("aria-label", "Volver arriba");
  subir.innerHTML = `
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <circle class="volver-arriba-anillo" cx="24" cy="24" r="21" />
      <path d="M24 31V17m0 0l-6 6m6-6l6 6" />
    </svg>`;
  document.body.appendChild(subir);
  const anillo = subir.querySelector(".volver-arriba-anillo");
  anillo.style.strokeDasharray = LARGO_ANILLO;
  subir.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  const fondosHero = document.querySelectorAll(".hero-bg");

  let pendiente = false;
  function actualizar() {
    pendiente = false;
    const y = window.scrollY;
    const alto = document.documentElement.scrollHeight - window.innerHeight;
    const avance = alto > 0 ? Math.min(Math.max(y / alto, 0), 1) : 0;

    barra.style.transform = `scaleX(${avance})`;
    anillo.style.strokeDashoffset = LARGO_ANILLO * (1 - avance);
    subir.classList.toggle("visible", y > 600);

    // Parallax suave: la foto del hero se mueve más lento que el texto
    fondosHero.forEach((fondo) => {
      const maximo = fondo.offsetHeight * 0.035;
      fondo.style.translate = `0 ${Math.min(y * 0.12, maximo)}px`;
    });
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!pendiente) {
        pendiente = true;
        requestAnimationFrame(actualizar);
      }
    },
    { passive: true }
  );
  actualizar();
}

/* ---------- Tarjetas con inclinación y brillo (solo con mouse) ---------- */

function prepararTilt(raiz, selectores) {
  selectores.forEach((selector) =>
    raiz.querySelectorAll(selector).forEach((tarjeta) => {
      if (tarjeta.classList.contains("tilt")) return;
      tarjeta.classList.add("tilt");
      if (getComputedStyle(tarjeta).position === "static") tarjeta.style.position = "relative";
      const brillo = document.createElement("span");
      brillo.className = "tilt-brillo";
      brillo.setAttribute("aria-hidden", "true");
      tarjeta.appendChild(brillo);
    })
  );
}

function iniciarTilt() {
  const MAXIMO = 6; // grados
  let actual = null;

  const soltar = (tarjeta) => {
    tarjeta.classList.remove("tilting");
    tarjeta.style.removeProperty("--rx");
    tarjeta.style.removeProperty("--ry");
  };

  document.addEventListener("pointermove", (evento) => {
    const tarjeta = evento.target.closest?.(".tilt") ?? null;

    if (actual && actual !== tarjeta) soltar(actual);
    actual = tarjeta;
    if (!tarjeta) return;

    const caja = tarjeta.getBoundingClientRect();
    const x = (evento.clientX - caja.left) / caja.width;
    const y = (evento.clientY - caja.top) / caja.height;

    tarjeta.classList.add("tilting");
    tarjeta.style.setProperty("--rx", `${(0.5 - y) * MAXIMO * 2}deg`);
    tarjeta.style.setProperty("--ry", `${(x - 0.5) * MAXIMO * 2}deg`);
    tarjeta.style.setProperty("--mx", `${x * 100}%`);
    tarjeta.style.setProperty("--my", `${y * 100}%`);
  });

  // Si el mouse sale de la ventana, la tarjeta vuelve a su sitio
  document.documentElement.addEventListener("mouseleave", () => {
    if (actual) soltar(actual);
    actual = null;
  });
}
