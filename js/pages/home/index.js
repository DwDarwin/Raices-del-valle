import { crearTarjetaProducto, vincularEventosTarjetas } from "../../components/productCard.js";
import { obtenerListaProductos } from "../../utils/productos.js";

const LIMITE_PRODUCTOS_DESTACADOS = 4;

export function inicializarHome(documento) {
  const cuadriculaProductos = documento.getElementById(
    "products-grid-container",
  );
  if (!cuadriculaProductos) return;

  const productosDestacados = obtenerListaProductos().slice(
    0,
    LIMITE_PRODUCTOS_DESTACADOS,
  );

  if (productosDestacados.length === 0) {
    cuadriculaProductos.innerHTML = "<p>No hay productos disponibles</p>";
    return;
  }

  cuadriculaProductos.innerHTML = productosDestacados
    .map((producto) => crearTarjetaProducto(producto))
    .join("");

  vincularEventosTarjetas(cuadriculaProductos, documento);
}
