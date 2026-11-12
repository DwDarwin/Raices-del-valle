function activarPreguntaPorHash(contenedorFiltros, preguntas) {
  if (!window.location.hash) return;

  const idDestino = window.location.hash.slice(1);
  const elementoDestino = document.getElementById(idDestino);
  if (!elementoDestino) return;

  if (elementoDestino.matches("details.faq-item")) {
    preguntas.forEach((pregunta) => {
      pregunta.hidden = false;
    });

    if (contenedorFiltros) {
      contenedorFiltros.querySelectorAll(".faq-tab-btn").forEach((tab) => {
        const esTodas = tab.dataset.filtro === "todas";
        tab.classList.toggle("active", esTodas);
        tab.setAttribute("aria-pressed", String(esTodas));
      });
    }

    elementoDestino.open = true;
    elementoDestino.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function inicializarEnvios() {
  const contenedorFiltros = document.getElementById("faqFilterBar");
  const preguntas = document.querySelectorAll(".faq-item[data-categoria]");

  if (!contenedorFiltros || preguntas.length === 0) return;

  contenedorFiltros.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".faq-tab-btn[data-filtro]");
    if (!boton) return;

    const categoriaSeleccionada = boton.dataset.filtro;

    contenedorFiltros.querySelectorAll(".faq-tab-btn").forEach((tab) => {
      const activo = tab === boton;
      tab.classList.toggle("active", activo);
      tab.setAttribute("aria-pressed", String(activo));
    });

    preguntas.forEach((pregunta) => {
      const coincide =
        categoriaSeleccionada === "todas" ||
        pregunta.dataset.categoria === categoriaSeleccionada;
      pregunta.hidden = !coincide;
    });
  });

  activarPreguntaPorHash(contenedorFiltros, preguntas);
  window.addEventListener("hashchange", () =>
    activarPreguntaPorHash(contenedorFiltros, preguntas),
  );
}

inicializarEnvios();
