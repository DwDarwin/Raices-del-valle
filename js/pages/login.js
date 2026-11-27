
import { apiRequest, API_ENDPOINTS } from "../services/api.js";
import { guardarSesion } from "../services/auth.js";
import { mostrarNotificacion } from "../services/notificaciones.js";
import {
    configurarRutasNavegacion,
    obtenerRutaProyecto,
} from "../utils/rutas.js";

configurarRutasNavegacion(document);

const formLogin = document.getElementById("loginForm");

const errorEmail = document.getElementById("errorEmail");
const errorPassword = document.getElementById("errorPassword");

const inputEmail = document.getElementById("email");
const inputPassword = document.getElementById("Contrasena");

if (formLogin) {
    formLogin.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        const valEmail = inputEmail.value.trim();
        const valPassword = inputPassword.value.trim();

        let formularioValido = true;

        if (valEmail === "") {
            errorEmail.style.display = "block";
            formularioValido = false;
        } else {
            errorEmail.style.display = "none";
        }

        if (valPassword === "") {
            errorPassword.style.display = "block";
            formularioValido = false;
        } else {
            errorPassword.style.display = "none";
        }

        if (!formularioValido) return;

        try {
            const respuesta = await apiRequest(API_ENDPOINTS.login, {
                method: "POST",
                body: JSON.stringify({
                    correo: valEmail,
                    contrasena: valPassword
                })
            });

            guardarSesion(respuesta.token, respuesta.usuario);

            const usuario = respuesta.usuario;


            // Si es administrador, ir directamente al dashboard
            if (usuario.rol === "ADMIN") {
                window.location.href = new URL(
                    "pages/admin.html",
                    obtenerRutaProyecto()
                ).href;

                return;
            }

            // Si es cliente y viene desde la canasta, regresar a ella
            const destino = new URLSearchParams(window.location.search).get("redirect");

            if (destino === "canasta.html") {
                window.location.href = new URL(
                    "canasta.html",
                    window.location.href
                ).href;
            } else {
                window.location.href = obtenerRutaProyecto().href;
            }

        } catch (error) {

            if (error.status === 401) {
                errorPassword.textContent =
                    "El correo o la contraseña son incorrectos.";

                errorPassword.style.display = "block";
                return;
            }

            await mostrarNotificacion({
                tipo: "error",
                titulo: "No fue posible iniciar sesión",
                mensaje: error.message
            });
        }
    });
}

// Limpiar errores cuando el usuario modifica el correo.
if (inputEmail) {
    inputEmail.addEventListener("input", () => {
        if (errorEmail) errorEmail.style.display = "none";
        if (errorPassword) errorPassword.style.display = "none";
    });
}

// Limpiar error cuando el usuario modifica la contraseña.
if (inputPassword) {
    inputPassword.addEventListener("input", () => {
        if (errorPassword) errorPassword.style.display = "none";
    });
}

const btnOjo = document.getElementById("ojo");


if (btnOjo && inputPassword) {
    btnOjo.addEventListener("click", function () {
        inputPassword.type =
            inputPassword.type === "password" ? "text" : "password";
    });
}
