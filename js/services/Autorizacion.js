
import {
    obtenerUsuario
} from "./auth.js";

import {
    obtenerRutaProyecto
} from "../utils/rutas.js";

export function protegerRuta(rolesPermitidos = []) {
    const usuario = obtenerUsuario();

    // Verificar que exista una sesión.
    if (!usuario) {
        window.location.href = new URL(
            "pages/login.html",
            obtenerRutaProyecto()
        ).href;

        return false;
    }

    // Verificar los permisos según el rol.
    if (
        rolesPermitidos.length > 0 &&
        !rolesPermitidos.includes(usuario.rol)
    ) {
        alert("No tienes permisos para acceder a esta página.");

        window.location.href = obtenerRutaProyecto().href;

        return false;
    }

    return true;
}
