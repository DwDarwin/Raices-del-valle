import { obtenerProductosMock } from "../data/productosMock.js";

export const CLAVE_PRODUCTOS = "rdv:productos";

function obtenerDatos() {
  try {
    const datos = localStorage.getItem(CLAVE_PRODUCTOS);
    return datos === null ? null : JSON.parse(datos);
  } catch (error) {
    console.error("No se pudieron leer los productos:", error);
    return null;
  }
}

function guardarDatos(productos) {
  try {
    localStorage.setItem(CLAVE_PRODUCTOS, JSON.stringify(productos));
    return true;
  } catch (error) {
    console.error("No se pudieron guardar los productos:", error);
    return false;
  }
}

export function obtenerProductos() {
  const productos = obtenerDatos();

  if (Array.isArray(productos)) {
    return productos;
  }

  const productosIniciales = obtenerProductosMock();
  guardarProductos(productosIniciales);
  return productosIniciales;
}

export function guardarProductos(productos) {
  const guardado = guardarDatos(productos);

  if (guardado) {
    document.dispatchEvent(new CustomEvent("productos:cambio"));
  }

  return guardado;
}

export function eliminarProductos() {
  try {
    localStorage.removeItem(CLAVE_PRODUCTOS);
    return true;
  } catch (error) {
    console.error("No se pudieron eliminar los productos:", error);
    return false;
  }
}
