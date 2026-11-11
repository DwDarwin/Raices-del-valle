export const CLAVE_SUSCRIPCION = "rdv:suscripcion";

export function obtenerSuscripcion() {
  try {
    const datos = localStorage.getItem(CLAVE_SUSCRIPCION);
    return datos === null ? null : JSON.parse(datos);
  } catch (error) {
    console.error("No se pudo leer la suscripción:", error);
    return null;
  }
}

export function guardarSuscripcion(correo, codigoDescuento) {
  try {
    localStorage.setItem(
      CLAVE_SUSCRIPCION,
      JSON.stringify({ correo, codigoDescuento }),
    );
    return true;
  } catch (error) {
    console.error("No se pudo guardar la suscripción:", error);
    return false;
  }
}

export function eliminarSuscripcion() {
  try {
    localStorage.removeItem(CLAVE_SUSCRIPCION);
    return true;
  } catch (error) {
    console.error("No se pudo eliminar la suscripción:", error);
    return false;
  }
}
