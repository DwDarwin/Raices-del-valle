
import { apiRequest, API_ENDPOINTS } from "../services/api.js";
import { configurarRutasNavegacion } from "../utils/rutas.js";

configurarRutasNavegacion(document);

const formRegistro = document.getElementById("registroForm");

if (formRegistro) {
    formRegistro.addEventListener("submit", async function(evento) {
        evento.preventDefault();

        const valNombre = document.getElementById("nombre").value.trim();
        const valDocumento = document.getElementById("documento").value.trim();
        const valTelefono = document.getElementById("telefono").value.trim();
        const valEmail = document.getElementById("email").value.trim();
        const valPassword = document.getElementById("password").value.trim();
        const valConfirmPassword = document.getElementById("confirmPassword").value.trim();

        if (!valNombre || !valDocumento || !valTelefono ||
            !valEmail || !valPassword || !valConfirmPassword) {
            alert("Todos los campos son obligatorios.");
            return;
        }

        const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

        if (!regexLetras.test(valNombre) || valNombre.split(/\s+/).length < 2) {
            alert("Ingresa un nombre y apellido válidos.");
            return;
        }

        if (valDocumento.length < 8 || valDocumento.length > 45) {
            alert("El documento debe tener entre 8 y 45 caracteres.");
            return;
        }

        if (!/^\d{10}$/.test(valTelefono)) {
            alert("El celular debe contener exactamente 10 números.");
            return;
        }

        if (valPassword.length < 8) {
            alert("La contraseña debe tener al menos 8 caracteres.");
            return;
        }

        if (valPassword !== valConfirmPassword) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        try {
            await apiRequest(API_ENDPOINTS.registro, {
                method: "POST",
                body: JSON.stringify({
                    nombre: valNombre,
                    documento: valDocumento,
                    telefono: valTelefono,
                    correo: valEmail,
                    contrasena: valPassword
                })
            });

            alert("¡Cuenta creada con éxito! Ahora puedes iniciar sesión.");

            formRegistro.reset();

        } catch (error) {
            alert(error.message);
        }
    });
}

const btnOjo = document.getElementById("togglePasswordBtn");
const inputPassword = document.getElementById("password");

if (btnOjo && inputPassword) {
    btnOjo.addEventListener("click", function() {
        inputPassword.type =
            inputPassword.type === "password" ? "text" : "password";
    });
}
