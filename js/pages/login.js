
import { apiRequest, API_ENDPOINTS } from "../services/api.js";
import { guardarSesion } from "../services/auth.js";

import {
    configurarRutasNavegacion,
    obtenerRutaProyecto,
} from "../utils/rutas.js";

configurarRutasNavegacion(document);

const formLogin = document.getElementById("loginForm");

if (formLogin) {
    formLogin.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        const valEmail = document.getElementById("email").value.trim();
        const valPassword = document.getElementById("Contrasena").value.trim();

        const errorEmail = document.getElementById("errorEmail");
        const errorPassword = document.getElementById("errorPassword");

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

            alert("¡Inicio de sesión exitoso!");

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
            alert(error.message);
        }
    });
}

const btnOjo = document.getElementById("ojo");
const inputPassword = document.getElementById("Contrasena");

if (btnOjo && inputPassword) {
    btnOjo.addEventListener("click", function () {
        inputPassword.type =
            inputPassword.type === "password" ? "text" : "password";
    });
}
