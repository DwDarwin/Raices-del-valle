// reemplazar por URL del backend desplegado

const API_BASE_URL = "http://localhost:8080";

export const API_URL = `${API_BASE_URL}/api`;

export const API_ENDPOINTS = {
    productos: `${API_URL}/productos`,
    pedidos: `${API_URL}/pedidos`
};

export async function apiRequest(url, opciones = {}) {
    const respuesta = await fetch(url, {
        ...opciones,
        headers: {
            "Content-Type": "application/json",
            ...opciones.headers
        }
    });

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
    const mensajesErrores = {
        400: "Los datos enviados no son válidos. Verifica la información.",
        401: "Tu sesión ha expirado. Debes iniciar sesión nuevamente.",
        403: "No tienes permisos para realizar esta operación.",
        404: "No se encontró el recurso solicitado.",
        409: "La operación no se pudo completar porque existe un conflicto.",
        500: "Ocurrió un error interno en el servidor. Inténtalo más tarde."
    };

    const mensaje =
        datos?.mensaje ||
        datos?.message ||
        mensajesErrores[respuesta.status] ||
        "No fue posible completar la solicitud.";

    throw new Error(mensaje);
}

    return datos;
}
