import { crearProductCard } from "../components/productCard.js";

export function renderizarCatalogoHome() {
  const gridContainer = document.getElementById("products-grid-container");
  if (!gridContainer) return;

  const productosString = localStorage.getItem("rdv:productos")
  const productosDestacados = JSON.parse(productosString).slice(0, 4) || [];

  if (productosDestacados.length === 0){
    gridContainer.innerHTML = "<p>No hay productos disponibles</p>";
    return
  }
  
  gridContainer.innerHTML = productosDestacados.map(crearProductCard).join("");
}
