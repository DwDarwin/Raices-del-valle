import { renderizarCatalogoHome } from "./home.js";

async function loadComponent(containerId, fileName) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const componentUrl = new URL(`../view/${fileName}`, import.meta.url);

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
  if (document.getElementById("products-grid-container")) {
    renderizarCatalogoHome();
  }

  await Promise.all([
    loadComponent("header-container", "header.html"),
    loadComponent("footer-container", "footer.html"),
  ]);
}

initializeApp();
