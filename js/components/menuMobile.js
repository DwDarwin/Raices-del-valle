export function inicializarMenuMobile() {
  const botonMenu = document.getElementById("menuToggle");
  const navMovil = document.querySelector(".nav-links");

  if (!botonMenu || !navMovil) return;

  botonMenu.addEventListener("click", () => {
    const estaActivo = navMovil.classList.toggle("active");

    if (estaActivo) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  });
}
