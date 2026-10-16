import { renderizarCatalogoHome } from "./home.js";

async function loadComponent(containerId, filePath) {
  const container = document.getElementById(containerId);
  if (!container) return;
  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    container.innerHTML = await response.text();
  } catch (error) {
    console.error(`Error cargando ${filePath}:`, error);
  }
}

async function initializeApp() {
  if (document.getElementById("products-grid-container")) {
    renderizarCatalogoHome();
  }
  
  await Promise.all([
    loadComponent("header-container", "./components/header.html"),
    loadComponent("footer-container", "./components/footer.html"),
  ]);
}

initializeApp();
