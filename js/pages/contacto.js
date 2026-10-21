/*   Raíces del Valle — Validación del formulario de contacto y envío con Formspree*/

import { enviarContacto } from "../../services/contacto.js";

document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("formContacto");
  const estado = document.getElementById("formEstado");
  const botonEnviar = document.getElementById("btnEnviar");
  const textoBoton = botonEnviar.querySelector(".btn-text");
  const contador = document.getElementById("mensajeContador");

  const campos = {
    nombre: document.getElementById("nombre"),
    correo: document.getElementById("correo"),
    telefono: document.getElementById("telefono"),
    motivo: document.getElementById("motivo"),
    mensaje: document.getElementById("mensaje"),
  };

  const LIMITE_MENSAJE = 500;
  let intentoEnvio = false; // la validación en vivo se activa después del primer intento

  /* ---------- Expresiones regulares ---------- */
  // Letras (incluye tildes y ñ), espacios, apóstrofo y guion
  const REGEX_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ '\-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/;
  // usuario@dominio.ext — sin espacios, con al menos un punto en el dominio
  const REGEX_CORREO = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9\-]+(?:\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,}$/;
  // Celular colombiano (3XX XXX XXXX) o fijo nuevo (60X XXX XXXX), con +57 opcional
  const REGEX_TELEFONO = /^(?:\+?57)?(3\d{9}|60\d{8})$/;

  /* ---------- Funciones de validación ---------- */
  // Cada función devuelve "" si el valor es correcto, o el mensaje de error.

  function validarNombre(valor) {
    const limpio = valor.trim().replace(/\s+/g, " ");
    if (limpio === "") return "Escribe tu nombre completo.";
    if (limpio.length < 3) return "El nombre debe tener al menos 3 letras.";
    if (limpio.length > 60) return "El nombre no puede superar los 60 caracteres.";
    if (!REGEX_NOMBRE.test(limpio)) return "El nombre solo puede contener letras y espacios.";
    return "";
  }

  function validarCorreo(valor) {
    const limpio = valor.trim();
    if (limpio === "") return "Escribe tu correo electrónico.";
    if (limpio.length > 100) return "El correo no puede superar los 100 caracteres.";
    if (limpio.includes("..")) return "El correo no puede tener dos puntos seguidos.";
    if (!REGEX_CORREO.test(limpio)) return "Escribe un correo válido, por ejemplo: nombre@correo.com.";
    return "";
  }

  function validarTelefono(valor) {
    const limpio = valor.trim();
    if (limpio === "") return "Escribe tu número de teléfono.";
    // Solo se permiten dígitos, espacios, guiones, paréntesis y un + al inicio
    if (!/^\+?[\d\s\-()]+$/.test(limpio)) return "El teléfono solo puede contener números.";
    const soloDigitos = limpio.replace(/[\s\-()]/g, "");
    if (!REGEX_TELEFONO.test(soloDigitos)) {
      return "Escribe un número colombiano de 10 dígitos (celular 3XX o fijo 60X).";
    }
    return "";
  }

  function validarMotivo(valor) {
    return valor === "" ? "Selecciona cómo podemos ayudarte." : "";
  }

  function validarMensaje(valor) {
    const limpio = valor.trim();
    if (limpio === "") return "Escribe tu mensaje.";
    if (limpio.length < 10) return "El mensaje debe tener al menos 10 caracteres.";
    if (limpio.length > LIMITE_MENSAJE) return `El mensaje no puede superar los ${LIMITE_MENSAJE} caracteres.`;
    return "";
  }

  const validadores = {
    nombre: validarNombre,
    correo: validarCorreo,
    telefono: validarTelefono,
    motivo: validarMotivo,
    mensaje: validarMensaje,
  };

  /* ---------- Mostrar estado de cada campo ---------- */
  function mostrarResultado(campo, mensajeError) {
    const contenedorError = document.getElementById(`${campo.id}Error`);
    if (mensajeError) {
      campo.classList.add("is-invalid");
      campo.classList.remove("is-valid");
      campo.setAttribute("aria-invalid", "true");
    } else {
      campo.classList.remove("is-invalid");
      campo.classList.add("is-valid");
      campo.removeAttribute("aria-invalid");
    }
    contenedorError.textContent = mensajeError;
  }

  function validarCampo(nombreCampo) {
    const campo = campos[nombreCampo];
    const error = validadores[nombreCampo](campo.value);
    mostrarResultado(campo, error);
    return error === "";
  }

  function validarFormulario() {
    let primerInvalido = null;
    Object.keys(campos).forEach((nombreCampo) => {
      const valido = validarCampo(nombreCampo);
      if (!valido && !primerInvalido) primerInvalido = campos[nombreCampo];
    });
    if (primerInvalido) primerInvalido.focus();
    return primerInvalido === null;
  }

  /* ---------- Validación en vivo ---------- */
  Object.keys(campos).forEach((nombreCampo) => {
    const campo = campos[nombreCampo];
    const evento = campo.tagName === "SELECT" ? "change" : "input";

    campo.addEventListener(evento, () => {
      if (intentoEnvio) validarCampo(nombreCampo);
    });

    // Al salir de un campo con contenido, se valida aunque no se haya enviado
    campo.addEventListener("blur", () => {
      if (intentoEnvio || campo.value.trim() !== "") validarCampo(nombreCampo);
    });
  });

  // Teléfono: bloquear letras mientras se escribe
  campos.telefono.addEventListener("input", () => {
    const filtrado = campos.telefono.value.replace(/[^\d\s\-()+]/g, "");
    if (filtrado !== campos.telefono.value) campos.telefono.value = filtrado;
  });

  // Contador de caracteres del mensaje
  function actualizarContador() {
    const largo = campos.mensaje.value.length;
    contador.textContent = `${largo} / ${LIMITE_MENSAJE}`;
    contador.classList.toggle("limite", largo >= LIMITE_MENSAJE);
  }
  campos.mensaje.addEventListener("input", actualizarContador);

  /* ---------- Mensajes generales ---------- */
  function mostrarEstado(texto, tipo) {
    estado.textContent = texto;
    estado.className = `form-status ${tipo}`;
  }

  function limpiarEstado() {
    estado.textContent = "";
    estado.className = "form-status";
  }

  function reiniciarFormulario() {
    formulario.reset();
    Object.values(campos).forEach((campo) => {
      campo.classList.remove("is-valid", "is-invalid");
      campo.removeAttribute("aria-invalid");
    });
    intentoEnvio = false;
    actualizarContador();
  }

  function bloquearBoton(bloquear) {
    botonEnviar.disabled = bloquear;
    textoBoton.textContent = bloquear ? "Enviando..." : "Enviar mensaje";
  }

  /* ---------- Envío con Formspree ---------- */
  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    intentoEnvio = true;
    limpiarEstado();

    // 1. Validar: si algo falla, no se envía nada
    if (!validarFormulario()) {
      mostrarEstado("Revisa los campos marcados en rojo.", "error");
      return;
    }

    // 2. Enviar los datos (limpios) a Formspree a través del servicio
    const datos = new FormData(formulario);
    datos.set("nombre", campos.nombre.value.trim().replace(/\s+/g, " "));
    datos.set("email", campos.correo.value.trim());
    datos.set("telefono", campos.telefono.value.replace(/[\s\-()]/g, ""));
    datos.set("mensaje", campos.mensaje.value.trim());

    bloquearBoton(true);
    const resultado = await enviarContacto(datos);
    bloquearBoton(false);

    if (resultado.ok) {
      reiniciarFormulario();
      mostrarEstado("¡Gracias! Recibimos tu mensaje y te responderemos pronto.", "exito");
    } else {
      mostrarEstado(resultado.mensaje, "error");
    }
  });
});