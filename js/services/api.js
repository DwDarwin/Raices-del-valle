// reemplazar por URL del backend desplegado


const API_BASE_URL = "http://localhost:8080";

export const API_URL = `${API_BASE_URL}/api`;

export const API_ENDPOINTS = {
    productos: `${API_URL}/productos`,
    pedidos: `${API_URL}/pedidos`,
    login: `${API_BASE_URL}/auth/login`,
    registro: `${API_BASE_URL}/auth/registro`,
    restablecerContrasena: `${API_BASE_URL}/auth/restablecer-contrasena`
};

// Error personalizado para conservar la información HTTP.
export class ApiError extends Error {
    constructor(mensaje, status = null, datos = null) {
        super(mensaje);
        this.name = "ApiError";
        this.status = status;
        this.datos = datos;
    }
}

const MENSAJES_ERRORES = {
    400: "Los datos enviados no son válidos. Verifica la información.",
    401: "Tu sesión ha expirado o las credenciales son incorrectas.",
    403: "No tienes permisos para realizar esta operación.",
    404: "No se encontró el recurso solicitado.",
    405: "La operación solicitada no está permitida.",
    409: "La operación no se pudo completar porque existe un conflicto.",
    422: "No fue posible procesar los datos enviados.",
    500: "Ocurrió un error interno en el servidor. Inténtalo más tarde.",
    502: "El servidor no está disponible temporalmente.",
    503: "El servicio no está disponible en este momento."
};

export async function apiRequest(url, opciones = {}) {
    const token = localStorage.getItem("token");

    let respuesta;

    try {
        respuesta = await fetch(url, {
            ...opciones,
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...opciones.headers
            }
        });
    } catch (error) {
        throw new ApiError(
            "No fue posible conectar con el servidor. Verifica tu conexión e inténtalo nuevamente."
        );
    }

    if (respuesta.status === 204) {
        return null;
    }

    const contenido = await respuesta.text();
    let datos = null;

    if (contenido) {
        try {
            datos = JSON.parse(contenido);
        } catch {
            datos = contenido;
        }
    }

    if (!respuesta.ok) {
        const mensaje =
            datos?.mensaje ||
            datos?.message ||
            MENSAJES_ERRORES[respuesta.status] ||
            "No fue posible completar la solicitud.";

        throw new ApiError(
            mensaje,
            respuesta.status,
            datos
        );
    }

    return datos;
}

