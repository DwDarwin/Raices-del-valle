import { inicializarCarrito } from "./carrito.js";
import { inicializarHome } from "./pages/home/index.js";
import { inicializarMenuMovil } from "./components/menuMobile.js";

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

function configurarRutasNavegacion(documento) {
  const rutaActual = window.location.pathname;
  const posicionPages = rutaActual.indexOf("/pages/");
  const raizProyecto =
    posicionPages >= 0
      ? rutaActual.slice(0, posicionPages + 1)
      : rutaActual.endsWith("/")
        ? rutaActual
        : rutaActual.slice(0, rutaActual.lastIndexOf("/") + 1);

  documento.querySelectorAll("[data-ruta]").forEach((enlace) => {
    enlace.href = `${raizProyecto}${enlace.dataset.ruta}`;
  });
}

async function initializeApp() {
  try {
    await Promise.all([
      loadComponent("header-container", "header.html"),
      loadComponent("footer-container", "footer.html"),
    ]);

    configurarRutasNavegacion(document);
    inicializarMenuMovil(document);
    inicializarCarrito();
    inicializarHome(document);
  } catch (error) {
    console.error("Fallo al inicializar", error);
  }
}

initializeApp();
