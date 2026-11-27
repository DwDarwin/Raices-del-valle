
const CLAVE_TOKEN = "token";
const CLAVE_USUARIO = "usuario";

export function guardarSesion(token, usuario) {
    localStorage.setItem(CLAVE_TOKEN, token);
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
}

export function obtenerToken() {
    return localStorage.getItem(CLAVE_TOKEN);
}

export function obtenerUsuario() {
    const usuario = localStorage.getItem(CLAVE_USUARIO);

    if (!usuario) return null;

    try {
        return JSON.parse(usuario);
    } catch {
        return null;
    }
}

export function obtenerSesion() {
    const token = obtenerToken();
    const usuario = obtenerUsuario();

    if (!token || !usuario) return null;

    return { token, usuario };
}

export function cerrarSesion() {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
}

export function tieneSesion() {
    return obtenerSesion() !== null;
}

export function esAdministrador() {
    return obtenerUsuario()?.rol === "ADMIN";
}
