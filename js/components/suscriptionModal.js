import {
  guardarSuscripcion,
  obtenerSuscripcion,
} from "../storage/suscripcionStorage.js";

const CODIGO_DESCUENTO = "RAICES10";

export function inicializarSuscripcion() {
  const formulario = document.getElementById("subscriptionForm");
  const correo = document.getElementById("newsletterEmail");
  const modal = document.getElementById("subscriptionModal");
  const codigo = document.getElementById("subscriptionDiscountCode");
  const cerrarModal = document.getElementById("closeSubscriptionModal");

  if (!formulario || !correo || !modal || !codigo || !cerrarModal) {
    return;
  }

  const suscripcionGuardada = obtenerSuscripcion();
  if (suscripcionGuardada?.correo) {
    correo.value = suscripcionGuardada.correo;
  }

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const correoIngresado = correo.value.trim();
    if (!correoIngresado || !correo.validity.valid) {
      correo.reportValidity();
      return;
    }

    if (!guardarSuscripcion(correoIngresado, CODIGO_DESCUENTO)) {
      return;
    }

    codigo.textContent = CODIGO_DESCUENTO;
    if (typeof modal.showModal === "function") {
      modal.showModal();
    } else {
      modal.setAttribute("open", "");
    }
  });

  cerrarModal.addEventListener("click", () => {
    if (typeof modal.close === "function") {
      modal.close();
    } else {
      modal.removeAttribute("open");
    }
  });
}
