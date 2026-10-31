import { crearProductCard } from "../components/productCard.js";

export function renderizarCatalogoHome() {
  const gridContainer = document.getElementById("products-grid-container");
  if (!gridContainer) return;

  const productosDestacados = obtenerDestacados();

  if (productosDestacados.length === 0) {
    gridContainer.innerHTML = "<p>No hay productos disponibles</p>";
    return;
  }

  gridContainer.innerHTML = productosDestacados.map(crearProductCard).join("");

  if (!gridContainer.dataset.eventosAsignados) {
    gridContainer.addEventListener("click", eventosCatalogoHome);
    gridContainer.dataset.eventosAsignados = "true";
  }
}

function obtenerDestacados(limite = 4) {
  try {
    const productos = localStorage.getItem("rdv:productos");
    const listaProductos = JSON.parse(productos);
    return Array.isArray(listaProductos) ? listaProductos.slice(0, limite) : [];
  } catch (error) {
    console.error("Error al cargar los productos destacados", error);
    return [];
  }
}

function eventosCatalogoHome(evento) {
  const btnAgregar = evento.target.closest(".card-add-btn");
  if (btnAgregar) {
    const card = btnAgregar.closest(".product-card");
    const id = card.dataset.id;

    if (id) {
      document.dispatchEvent(
        new CustomEvent("raices:agregar-carrito", {
          detail: {
            productoId: id,
            cantidad: 1,
          },
        }),
      );
    }
    return;
  }

  const btnFavorito = evento.target.closest(".card-wishlist");
  if (btnFavorito) {
    const icono = btnFavorito.querySelector("i");
    if (icono) {
      icono.classList.toggle("bx-heart");
      icono.classList.toggle("bxs-heart");
    }
  }
}
