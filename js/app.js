import './components/sesion.js';
import { inicializarCarrito } from "./components/carrito.js";
import { inicializarHome } from "./pages/home.js";
import { inicializarMenuMovil } from "./components/menuMobile.js";
import { inicializarSuscripcion } from "./components/suscriptionModal.js";
import { configurarRutasNavegacion } from "./utils/rutas.js";
import { inicializarBuscador } from "./components/buscador.js";


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

    configurarRutasNavegacion(document);
    inicializarMenuMovil(document);
    inicializarCarrito();
    inicializarHome(document);
    inicializarBuscador();
    inicializarSuscripcion();
  } catch (error) {
    console.error("Fallo al inicializar", error);
  }
}

initializeApp();
