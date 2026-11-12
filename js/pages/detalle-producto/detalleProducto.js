import { obtenerProductos } from "../../storage/productoStorage.js";
import {
  renderizarDetalle,
  renderizarRutaNavegacion,
  renderizarProductosRelacionados,
} from "./detalleProductoVista.js";
import { vincularInteraccionesDetalle } from "./detalleProductoEventos.js";

document.addEventListener("DOMContentLoaded", () =>
  inicializarDetalleProducto(document),
);

export function inicializarDetalleProducto(documento) {
  const productosSinNormalizar = obtenerProductos();
  if (productosSinNormalizar.length === 0) return;

  const productos = productosSinNormalizar.map(normalizarProductoDetalle);
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

  vincularInteraccionesDetalle(productoSeleccionado, documento);
}

function normalizarProductoDetalle(productoOriginal) {
  const producto = productoOriginal || {};

  return {
    id: producto.id,
    name: producto.name || producto.nombre || "Producto campesino",
    category: producto.category || producto.categoria,
    price: Number(producto.price ?? producto.precio ?? 0),
    unit:
      producto.unit ||
      producto.presentacion ||
      producto.unidadVenta ||
      "unidad",
    image: producto.image || producto.imagen || "",
    description:
      producto.description ||
      producto.descripcion ||
      "Pequeña, dorada y de textura cremosa. Recolectada a mano en su punto justo para conservar todo el sabor de nuestra tierra.",
    producer: "Finca Familia Chindoy",
    tag: producto.tag || producto.etiqueta || "COSECHA FRESCA",
    gallery:
      Array.isArray(producto.gallery) && producto.gallery.length > 0
        ? producto.gallery
        : [
            producto.image || producto.imagen || "",
            "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80",
          ],
  };
}
