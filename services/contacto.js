/*   Raíces del Valle — Servicio de envío del formulario de contacto (Formspree)*/

const FORMSPREE_URL = "https://formspree.io/f/maeqagwj";

// Devuelve { ok: true } si se envió, o { ok: false, mensaje } con el motivo del fallo.
export async function enviarContacto(datos) {
  try {
    const respuesta = await fetch(FORMSPREE_URL, {
      method: "POST",
      body: datos,
      headers: { Accept: "application/json" },
    });

    if (respuesta.ok) return { ok: true };

    const resultado = await respuesta.json().catch(() => ({}));
    const detalle = Array.isArray(resultado.errors)
      ? resultado.errors.map((e) => e.message).join(" ")
      : "";
    return {
      ok: false,
      mensaje: `No pudimos enviar tu mensaje. ${detalle || "Inténtalo de nuevo en unos minutos."}`,
    };
  } catch (error) {
    // fetch solo lanza excepción cuando no hay red; se informa al usuario en vez de relanzarla
    console.error("Error de red al enviar el formulario:", error);
    return { ok: false, mensaje: "No hay conexión. Revisa tu internet e inténtalo de nuevo." };
  }
}
