import { PRODUCTOS_COSECHA } from "./data.js";
import { crearProductCard } from "./components/productCard.js";

export function renderizarCatalogoHome() {
  const gridContainer = document.getElementById("products-grid-container");
  if (!gridContainer) return;

  const productosDestacados = PRODUCTOS_COSECHA.slice(0, 4);

  gridContainer.innerHTML = productosDestacados.map(crearProductCard).join("");
}
