import {
  obtenerListaProductos,
  normalizarProducto,
} from "../../utils/productos.js";
import {
  renderizarDetalle,
  renderizarRutaNavegacion,
  renderizarProductosRelacionados,
} from "./renderizado.js";
import { vincularEventosDetalle } from "./eventos.js";

document.addEventListener("DOMContentLoaded", () =>
  inicializarDetalleProducto(document),
);

export function inicializarDetalleProducto(documento) {
  const productosSinNormalizar = obtenerListaProductos();
  if (productosSinNormalizar.length === 0) return;

  const productos = productosSinNormalizar.map(normalizarProducto);
  const parametrosURL = new URLSearchParams(window.location.search);
  const idProductoEnURL = parametrosURL.get("id");

  const productoSeleccionado =
    productos.find(
      (producto) => String(producto.id) === String(idProductoEnURL),
    ) || productos[0];

  documento.title = `${productoSeleccionado.name} | Raíces del Valle`;

  const listaRutaNavegacion = documento.getElementById("breadcrumb-list");
  if (listaRutaNavegacion) {
    listaRutaNavegacion.innerHTML =
      renderizarRutaNavegacion(productoSeleccionado);
  }

  const contenedorDetalle = documento.getElementById(
    "product-detail-container",
  );
  if (contenedorDetalle) {
    contenedorDetalle.innerHTML = renderizarDetalle(productoSeleccionado);
  }

  renderizarProductosRelacionados(
    documento,
    productos,
    productoSeleccionado.id,
  );

  vincularEventosDetalle(productoSeleccionado, documento);
}
