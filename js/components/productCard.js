import { formatearMoneda } from "../utils/formato.js";

export function crearTarjetaProducto(producto, esPaginaSecundaria = false) {
  const rutaDetalle = obtenerRutaDetalle(producto.id, esPaginaSecundaria);

  return `
    <article class="product-card" data-id="${producto.id}">
      <div class="card-img-box">
        <span class="card-tag">${producto.category}</span>
        <button type="button" class="card-wishlist" aria-label="Añadir a favoritos">
                    <i class='bx bx-heart bx-sm'></i>                
        </button>
        <a href="${rutaDetalle}" class="card-link-img" aria-label="Ver detalle de ${producto.name}">
          <img src="${producto.image}" alt="${producto.name}" class="card-img" loading="lazy">
        </a>
      </div>
      <div class="card-meta">
        <span class="card-category">${producto.category}</span>
        <span class="card-price">${formatearMoneda(producto.price)}</span>
      </div>
      <div class="card-row">
        <h3 class="card-title">
          <a href="${rutaDetalle}" class="card-title-link">${producto.name}</a>
        </h3>
        <button type="button" class="card-add-btn" aria-label="Añadir al carrito">
          <i class='bx bx-plus-circle bx-md'></i>
          <i class='bx bxs-plus-circle bx-md add-click'></i>
        </button>
      </div>
      <span class="card-unit">${producto.unit}</span>
    </article>
  `;
}

function obtenerRutaDetalle(idProducto, esPaginaSecundaria) {
  const rutaBase = esPaginaSecundaria
    ? "./detalle-producto.html"
    : "./pages/detalle-producto.html";

  return `${rutaBase}?id=${encodeURIComponent(idProducto)}`;
}

export function vincularEventosTarjetas(contenedor, documento) {
  if (!contenedor || contenedor.dataset.eventosTarjetaAsignados) return;

  contenedor.addEventListener("click", (evento) => {
    if (manejarAgregarAlCarrito(evento, documento)) {
      return;
    }

    manejarFavorito(evento);
  });

  contenedor.dataset.eventosTarjetaAsignados = "true";
}

function manejarAgregarAlCarrito(evento, documento) {
  const botonAgregar = evento.target.closest(".card-add-btn");
  if (!botonAgregar) return false;

  evento.preventDefault();
  const tarjeta = botonAgregar.closest(".product-card");
  const idProducto = tarjeta?.dataset.id;

  if (idProducto) {
    documento.dispatchEvent(
      new CustomEvent("raices:agregar-carrito", {
        detail: { productoId: idProducto, cantidad: 1 },
      }),
    );
  }

  return true;
}

function manejarFavorito(evento) {
  const botonFavorito = evento.target.closest(".card-wishlist");
  if (!botonFavorito) return;

  evento.preventDefault();
  const icono = botonFavorito.querySelector("i");
  if (!icono) return;

  icono.classList.toggle("bx-heart");
  icono.classList.toggle("bxs-heart");
}
