
import {
  crearTarjetaProducto,
  vincularEventosTarjetas
} from "../components/productCard.js";

import { API_ENDPOINTS } from "../services/api.js";

export async function inicializarHome(documento) {
  const cuadriculaProductos = documento.getElementById(
    "products-grid-container"
  );

  if (!cuadriculaProductos) return;

  try {
   const respuesta = await fetch(API_ENDPOINTS.productos);

    if (!respuesta.ok) {
      throw new Error(
        `Error al consultar productos: ${respuesta.status}`
      );
    }

    const productosBD = await respuesta.json();

    // Filtrar productos disponibles
    const productosDestacados = productosBD
  .filter(producto =>
    String(producto.estado).trim().toLowerCase() === "publicado" &&
    Number(producto.stock) > 0
  )
  .slice(0, 4);

    if (productosDestacados.length === 0) {
      cuadriculaProductos.innerHTML =
        "<p>No hay productos disponibles</p>";
      return;
    }

    // Adaptar los datos del backend al formato de ProductCard
    const productosAdaptados = productosDestacados.map(producto => ({
      id: producto.id,
      name: producto.nombre,
      category: producto.categoria,
      price: Number(producto.precio),
      unit: producto.unidadVenta,
      image: producto.imagen
    }));

    // Renderizar tarjetas
    cuadriculaProductos.innerHTML = productosAdaptados
      .map(producto => crearTarjetaProducto(producto))
      .join("");

    vincularEventosTarjetas(cuadriculaProductos, documento);

  } catch (error) {
    console.error(
      "Error al cargar productos destacados:",
      error
    );

    cuadriculaProductos.innerHTML =
      "<p>No fue posible cargar los productos destacados.</p>";
  }
}
