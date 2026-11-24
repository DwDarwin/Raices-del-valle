import {
  renderizarDetalle,
  renderizarRutaNavegacion,
  renderizarProductosRelacionados,
} from "./detalleProductoVista.js";
import { vincularInteraccionesDetalle } from "./detalleProductoEventos.js";

document.addEventListener("DOMContentLoaded", () =>
  inicializarDetalleProducto(document),
);

export async function inicializarDetalleProducto(documento) {
  try {
    // Consultar los productos desde el backend
    const respuesta = await fetch(
      "http://localhost:8080/api/productos"
    );

    if (!respuesta.ok) {
      throw new Error(
        `Error al consultar productos: ${respuesta.status}`
      );
    }

    const productosSinNormalizar = await respuesta.json();

    if (productosSinNormalizar.length === 0) {
      console.warn("No hay productos disponibles.");
      return;
    }

    // Normalizar los productos recibidos
    const productos = productosSinNormalizar.map(
      normalizarProductoDetalle
    );

    // Obtener el ID desde la URL
    const parametrosURL = new URLSearchParams(window.location.search);
    const idProductoEnURL = parametrosURL.get("id");

    // Buscar el producto solicitado
    const productoSeleccionado = productos.find(
      producto => String(producto.id) === String(idProductoEnURL)
    );

    if (!productoSeleccionado) {
      console.error("No se encontró el producto solicitado.");
      return;
    }

    // Actualizar título de la página
    documento.title = `${productoSeleccionado.name} | Raíces del Valle`;

    // Renderizar ruta de navegación
    const listaRutaNavegacion = documento.getElementById(
      "breadcrumb-list"
    );

    if (listaRutaNavegacion) {
      listaRutaNavegacion.innerHTML =
        renderizarRutaNavegacion(productoSeleccionado);
    }

    // Renderizar detalle del producto
    const contenedorDetalle = documento.getElementById(
      "product-detail-container"
    );

    if (contenedorDetalle) {
      contenedorDetalle.innerHTML =
        renderizarDetalle(productoSeleccionado);
    }

    // Renderizar productos relacionados
    renderizarProductosRelacionados(
      documento,
      productos,
      productoSeleccionado.id
    );

    // Vincular eventos e interacciones
    vincularInteraccionesDetalle(productoSeleccionado, documento);

  } catch (error) {
    console.error(
      "Error al cargar el detalle del producto:",
      error
    );
  }
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
      "Recolectada a mano en su punto justo para conservar todo el sabor de nuestra tierra.",
    producer: "Finca Familia Chindoy",
    tag: producto.tag || producto.etiqueta || "COSECHA FRESCA",
    gallery:
      Array.isArray(producto.gallery) && producto.gallery.length > 0
        ? producto.gallery
        : [
            producto.image || producto.imagen || "",
            
          ],
  };
}
