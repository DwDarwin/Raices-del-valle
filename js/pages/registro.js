import {
    existeUsuario,
    guardarUsuario,
} from "../storage/usuariosStorage.js";
import { configurarRutasNavegacion } from "../utils/rutas.js";

configurarRutasNavegacion(document);

const formRegistro = document.getElementById('registroForm'); 

if (formRegistro) {
    formRegistro.addEventListener('submit', function(evento) {
        evento.preventDefault(); 

        const valNombre = document.getElementById('nombre').value.trim();
        const valTelefono = document.getElementById('telefono').value.trim();
        const valEmail = document.getElementById('email').value.trim();
        const valPassword = document.getElementById('password').value.trim();
        const valConfirmPassword = document.getElementById('confirmPassword').value.trim();

        if (valNombre === "" || valTelefono === "" || valEmail === "" || valPassword === "" || valConfirmPassword === "") {
            alert("Por favor, completa todos los campos antes de continuar.");
            return; 
        }

        const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        if (!regexLetras.test(valNombre)) {
            alert("El nombre no debe contener números ni caracteres especiales.");
            return;
        }
        
        if (valNombre.split(/\s+/).length < 2) {
            alert("Por favor, ingresa al menos un nombre y un apellido.");
            return;
        }

        const regexNumeros = /^\d{10}$/; 
        if (!regexNumeros.test(valTelefono)) {
            alert("El celular debe contener exactamente 10 números, sin letras ni espacios intermedios.");
            return;
        }

        if (valPassword.length < 8) {
            alert("La contraseña debe tener al menos 8 caracteres.");
            return;
        }

        if (valPassword !== valConfirmPassword) {
            alert("Las contraseñas no coinciden. Por favor, verifícalas.");
            return;
        }

        if (existeUsuario(valEmail)) {
            alert("Este correo ya está registrado. Por favor, usa otro o inicia sesión.");
            return;
        }

        const nuevoUsuario = {
            nombreCompleto: valNombre,
            numeroTelefono: valTelefono,
            emailUsuario: valEmail,
            passwordUsuario: valPassword
        };

        if (!guardarUsuario(nuevoUsuario)) {
            alert("No se pudo crear la cuenta. Inténtalo nuevamente.");
            return;
        }

        alert("¡Cuenta creada con éxito!");
        
        formRegistro.reset(); 
    });
}

const btnOjo = document.getElementById('togglePasswordBtn'); 
const inputPassword = document.getElementById('password');

if (btnOjo && inputPassword) {
    btnOjo.addEventListener('click', function() {
        if (inputPassword.type === 'password') {
            inputPassword.type = 'text';
        } else {
            inputPassword.type = 'password';
        }
    });
}