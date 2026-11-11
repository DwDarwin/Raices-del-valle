import { crearTarjetaProducto, vincularEventosTarjetas } from "../components/productCard.js";
import { obtenerProductos } from "../storage/productoStorage.js";

export function inicializarHome(documento) {
  const cuadriculaProductos = documento.getElementById(
    "products-grid-container",
  );
  if (!cuadriculaProductos) return;

  const productosDestacados = obtenerProductos().slice(0, 4);

  if (productosDestacados.length === 0) {
    cuadriculaProductos.innerHTML = "<p>No hay productos disponibles</p>";
    return;
  }

  cuadriculaProductos.innerHTML = productosDestacados
    .map((producto) => crearTarjetaProducto(producto))
    .join("");

  vincularEventosTarjetas(cuadriculaProductos, documento);
}
