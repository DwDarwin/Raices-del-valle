export const CLAVE_SESION = "usuarioActivo";

export function obtenerSesionActiva() {
  try {
    const datos = localStorage.getItem(CLAVE_SESION);
    return datos === null ? null : JSON.parse(datos);
  } catch (error) {
    console.error("No se pudo leer la sesión activa:", error);
    return null;
  }
}

export function guardarSesionActiva(usuario) {
  try {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(usuario));
    return true;
  } catch (error) {
    console.error("No se pudo guardar la sesión activa:", error);
    return false;
  }
}

export function cerrarSesion() {
  try {
    localStorage.removeItem(CLAVE_SESION);
  } catch (error) {
    console.error("No se pudo cerrar la sesión:", error);
  }
}
