import { inicializarCarrito } from "./carrito.js";
import { renderizarCatalogoHome } from "./pages/home.js";
import { inicializarMenuMobile } from "./components/menuMobile.js";

async function loadComponent(containerId, fileName) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const componentUrl = new URL(`../pages/${fileName}`, import.meta.url);

  try {
    const response = await fetch(componentUrl);
    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${componentUrl}`);
    }
    container.innerHTML = await response.text();
  } catch (error) {
    console.error(`Error cargando ${fileName}:`, error);
  }
}

async function initializeApp() {
  try {
    await Promise.all([
      loadComponent("header-container", "header.html"),
      loadComponent("footer-container", "footer.html"),
    ]);

    inicializarMenuMobile();
    inicializarCarrito();

    if (document.getElementById("products-grid-container")) {
      renderizarCatalogoHome();
    }
  } catch (error) {
    console.error("Fallo al inicializar", error);
  }
}

initializeApp();
