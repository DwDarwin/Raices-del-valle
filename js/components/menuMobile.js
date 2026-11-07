export function inicializarMenuMovil(documento) {
  const botonMenu = documento.getElementById("menuToggle");
  const navegacionMovil = documento.querySelector(".nav-links");

  if (!botonMenu || !navegacionMovil) return;

  botonMenu.addEventListener("click", () => {
    const estaActivo = navegacionMovil.classList.toggle("active");

    documento.body.style.overflow = estaActivo ? "hidden" : "";
  });
}
