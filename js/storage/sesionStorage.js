export const CLAVE_SESION = "usuarioActivo";
export const CLAVE_USUARIO_API = "usuario";
export const CLAVE_TOKEN_SESION = "token";

export function obtenerSesionActiva() {
  try {
    const datos =
      localStorage.getItem(CLAVE_SESION) ??
      localStorage.getItem(CLAVE_USUARIO_API);
    return datos === null ? null : JSON.parse(datos);
  } catch (error) {
    console.error("No se pudo leer la sesión activa:", error);
    return null;
  }
}

export function obtenerTokenSesion() {
  try {
    return localStorage.getItem(CLAVE_TOKEN_SESION);
  } catch (error) {
    console.error("No se pudo leer el token de sesión:", error);
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
    localStorage.removeItem(CLAVE_USUARIO_API);
    localStorage.removeItem(CLAVE_TOKEN_SESION);
  } catch (error) {
    console.error("No se pudo cerrar la sesión:", error);
  }
}
