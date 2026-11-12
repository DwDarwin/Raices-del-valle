import { formatearMoneda } from "../../utils/formato.js";
import {
  crearTarjetaProducto,
  vincularEventosTarjetas,
} from "../../components/productCard.js";

export function renderizarRutaNavegacion(producto) {
  const categoria = producto.category || "Mercado";
  const nombre = producto.name || "Detalle";
  const categoriaCodificada = encodeURIComponent(
    categoria.toLowerCase().trim(),
  );
  const rutaInicio = new URL("../../index.html", import.meta.url).href;

  return `
    <li><a href="${rutaInicio}">Inicio</a></li>
    <li><i class='bx bx-chevron-right'></i></li>
    <li><a href="./mercado.html?categoria=${categoriaCodificada}">${categoria}</a></li>
    <li><i class='bx bx-chevron-right'></i></li>
    <li class="breadcrumb-selected" aria-current="page">${nombre}</li>
  `;
}

export function renderizarDetalle(producto) {
  return `
    ${renderizarGaleria(producto)}
    ${renderizarInformacionProducto(producto)}
  `;
}

function renderizarGaleria(producto) {
  const miniaturas = producto.gallery
    .map(
      (rutaImagen, indice) => `
        <button type="button" class="thumb ${indice === 0 ? "active" : ""}" data-img="${rutaImagen}">
          <img src="${rutaImagen}" alt="Vista ${indice + 1}">
        </button>
      `,
    )
    .join("");

  return `
    <div class="product-gallery">
      <div class="main-image-wrapper">
        <span class="card-tag">${producto.tag}</span>
        <img id="main-product-img" src="${producto.gallery[0]}" alt="${producto.name}">
      </div>
      <div class="thumbnails-track" id="gallery-thumbnails">
        ${miniaturas}
      </div>
    </div>
  `;
}

function renderizarInformacionProducto(producto) {
  return `
    <div class="product-info">
      <span class="product-origin">${producto.category.toUpperCase()} · SIBUNDOY</span>
      <h1 class="product-title">${producto.name}</h1>
      <div class="product-rating">
        <i class="bx bxs-star"></i>
        <span class="score">4.9</span>
        <span class="reviews-count">(18 reseñas)</span>
      </div>
      <div class="product-price">
        <span class="amount">${formatearMoneda(producto.price)}</span>
        <span class="unit">/ ${producto.unit}</span>
      </div>
      <p class="product-description">${producto.description}</p>
      ${renderizarProductor(producto)}
      ${renderizarAccionesCompra(producto)}
      <div class="delivery-notice">
        <i class="bx bx-car icon-delivery"></i>
        <div>
          <p class="delivery-highlight">Entrega estimada: viernes 20 de Noviembre</p>
          <p class="delivery-sub">Compra antes del miércoles a las 6 p.m.</p>
        </div>
      </div>
      ${renderizarAcordeones()}
    </div>
  `;
}

function renderizarProductor(producto) {
  return `
    <div class="producer-card">
      <div class="producer-avatar">
        <img src="../assets/products/productor-finca.png" alt="${producto.producer}">
      </div>
      <div class="producer-text">
        <small>CULTIVADO POR</small>
        <h3>${producto.producer}</h3>
        <a href="./finca.html" class="producer-link">Conoce la historia <i class="bx bx-right-arrow-alt"></i></a>
      </div>
    </div>
  `;
}

function renderizarAccionesCompra(producto) {
  return `
    <div class="purchase-actions">
      <div class="quantity-selector">
        <button type="button" id="btn-decrease" aria-label="Disminuir cantidad">−</button>
        <span id="quantity-display">1</span>
        <button type="button" id="btn-increase" aria-label="Aumentar cantidad">+</button>
      </div>
      <button type="button" class="btn btn-primary btn-add-main" id="btn-detail-add-cart">
        <span>Agregar · <span id="cart-total-price">${formatearMoneda(producto.price)}</span></span>
        <i class="bx bx-shopping-bag"></i>
      </button>
    </div>
  `;
}

function renderizarAcordeones() {
  return `
    <div class="accordion-group">
      <details class="accordion-item" open>
        <summary><span>Detalles del producto</span><i class="bx bx-plus icon-toggle"></i></summary>
        <div class="accordion-content">
          <p>Variedad nativa cultivada a más de 2.200 m s. n. m. 100% libre de pesticidas sintéticos y regada con aguas de páramo.</p>
        </div>
      </details>
      <details class="accordion-item">
        <summary><span>Cómo conservarlo</span><i class="bx bx-plus icon-toggle"></i></summary>
        <div class="accordion-content">
          <p>Mantén en un lugar fresco, seco y oscuro, preferiblemente en canasto ventilado o bolsa de papel. No refrigerar cruda.</p>
        </div>
      </details>
      <details class="accordion-item">
        <summary><span>Envíos y devoluciones</span><i class="bx bx-plus icon-toggle"></i></summary>
        <div class="accordion-content">
          <p>Entregas directas de la finca semanalmente. Si el producto presenta inconvenientes, lo reponemos sin costo.</p>
        </div>
      </details>
    </div>
  `;
}

export function renderizarProductosRelacionados(
  documento,
  productos,
  idProductoSeleccionado,
) {
  const cuadriculaRelacionados = documento.getElementById(
    "related-products-grid",
  );
  if (!cuadriculaRelacionados) return;

  const productosRelacionados = productos
    .filter(
      (producto) => String(producto.id) !== String(idProductoSeleccionado),
    )
    .slice(0, 4);

  cuadriculaRelacionados.innerHTML = productosRelacionados
    .map((producto) => crearTarjetaProducto(producto, true))
    .join("");
  vincularEventosTarjetas(cuadriculaRelacionados, documento);
}
