export const CLAVE_CARRITO = "rdv:carrito";
export const EVENTO_CARRITO_ACTUALIZADO = "rdv:carrito-actualizado";

function obtenerDatos() {
  try {
    const datos = localStorage.getItem(CLAVE_CARRITO);
    return datos === null ? [] : JSON.parse(datos);
  } catch (error) {
    console.error("No se pudo leer el carrito:", error);
    return [];
  }
}

function normalizarItemCarrito(item) {
  return {
    ...item,
    id: String(item.id),
    cantidad: Math.floor(Number(item.cantidad)),
    precio: Number(item.precio) || 0,
  };
}

export function normalizarProductoParaCarrito(producto) {
  return {
    id: String(producto.id),
    nombre: producto.name ?? producto.nombre ?? "Producto",
    precio: Number(producto.price ?? producto.precio) || 0,
    unidad: producto.unit ?? producto.unidadVenta ?? "",
    imagen: producto.image ?? producto.imagen ?? "",
    categoria: producto.category ?? producto.categoria ?? "",
  };
}

export function obtenerCarrito() {
  const datos = obtenerDatos();

  if (!Array.isArray(datos)) {
    return [];
  }

  return datos
    .filter((item) => item && item.id != null && Number(item.cantidad) > 0)
    .map(normalizarItemCarrito);
}

export function agregarProducto(carrito, producto, cantidad = 1) {
  const productoNormalizado = normalizarProductoParaCarrito(producto);
  const cantidadNormalizada = Math.max(1, Math.floor(Number(cantidad) || 1));
  const productoExistente = carrito.find(
    (item) => String(item.id) === productoNormalizado.id,
  );

  if (productoExistente) {
    productoExistente.cantidad += cantidadNormalizada;
  } else {
    carrito.push({
      ...productoNormalizado,
      cantidad: cantidadNormalizada,
    });
  }

  return carrito;
}

export function actualizarCantidadProducto(carrito, idProducto, cambio) {
  const indice = carrito.findIndex(
    (item) => String(item.id) === String(idProducto),
  );

  if (indice === -1) {
    return carrito;
  }

  carrito[indice].cantidad += cambio;

  if (carrito[indice].cantidad <= 0) {
    carrito.splice(indice, 1);
  }

  return carrito;
}

export function eliminarProducto(carrito, idProducto) {
  return carrito.filter((item) => String(item.id) !== String(idProducto));
}

export function obtenerCantidadTotal(carrito) {
  return carrito.reduce((total, item) => total + item.cantidad, 0);
}

export function obtenerTotal(carrito) {
  return carrito.reduce(
    (total, item) => total + item.precio * item.cantidad,
    0,
  );
}

export function guardarCarrito(carrito) {
  let guardado = false;

  try {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
    guardado = true;
  } catch (error) {
    console.error("No se pudo guardar el carrito:", error);
  }

  if (guardado) {
    document.dispatchEvent(
      new CustomEvent(EVENTO_CARRITO_ACTUALIZADO, {
        detail: { carrito },
      }),
    );
  }

  return guardado;
}

export function eliminarCarrito() {
  try {
    localStorage.removeItem(CLAVE_CARRITO);
    document.dispatchEvent(new CustomEvent(EVENTO_CARRITO_ACTUALIZADO));
    return true;
  } catch (error) {
    console.error("No se pudo eliminar el carrito:", error);
    return false;
  }
}
