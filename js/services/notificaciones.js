
let colaNotificaciones = Promise.resolve();

const CONFIGURACION_TIPOS = {
  exito: {
    etiqueta: "OPERACIÓN EXITOSA",
    icono: "bx bx-check",
  },
  error: {
    etiqueta: "ERROR",
    icono: "bx bx-x",
  },
  advertencia: {
    etiqueta: "ATENCIÓN",
    icono: "bx bx-error-circle",
  },
  informacion: {
    etiqueta: "INFORMACIÓN",
    icono: "bx bx-info-circle",
  },
  confirmacion: {
    etiqueta: "CONFIRMACIÓN",
    icono: "bx bx-help-circle",
  },
};

function abrirNotificacion(configuracion) {
  return new Promise((resolve, reject) => {
    const modal = document.getElementById("modalNotificacion");

    const elementos = {
      icono: document.querySelector("#notificacionIcono i"),
      etiqueta: document.getElementById("notificacionEtiqueta"),
      titulo: document.getElementById("notificacionTitulo"),
      mensaje: document.getElementById("notificacionMensaje"),
      aceptar: document.getElementById("notificacionAceptar"),
      cancelar: document.getElementById("notificacionCancelar"),
    };

    if (!modal || Object.values(elementos).some(e => !e)) {
      reject(new Error("No se encontró el modal de notificaciones."));
      return;
    }

    const tipo = CONFIGURACION_TIPOS[configuracion.tipo]
      ? configuracion.tipo
      : "informacion";

    const estilo = CONFIGURACION_TIPOS[tipo];

    elementos.icono.className = estilo.icono;
    elementos.etiqueta.textContent =
      configuracion.etiqueta || estilo.etiqueta;
    elementos.titulo.textContent =
      configuracion.titulo || "Notificación";
    elementos.mensaje.textContent =
      configuracion.mensaje || "";

    elementos.aceptar.textContent =
      configuracion.textoAceptar || "Aceptar";

    elementos.cancelar.hidden = !configuracion.confirmacion;
    elementos.cancelar.textContent =
      configuracion.textoCancelar || "Cancelar";

    const finalizar = (resultado) => {
      modal.removeEventListener("close", alCerrar);
      elementos.aceptar.removeEventListener("click", aceptar);
      elementos.cancelar.removeEventListener("click", cancelar);
      modal.removeEventListener("cancel", alCancelar);

      resolve(resultado);
    };

    const alCerrar = () => {
      finalizar(modal.returnValue === "aceptar");
    };

    const aceptar = () => modal.close("aceptar");
    const cancelar = () => modal.close("cancelar");

    const alCancelar = () => {
      modal.returnValue = "cancelar";
    };

    modal.addEventListener("close", alCerrar);
    elementos.aceptar.addEventListener("click", aceptar);
    elementos.cancelar.addEventListener("click", cancelar);
    modal.addEventListener("cancel", alCancelar);

    try {
      modal.showModal();
    } catch (error) {
      modal.removeEventListener("close", alCerrar);
      elementos.aceptar.removeEventListener("click", aceptar);
      elementos.cancelar.removeEventListener("click", cancelar);
      modal.removeEventListener("cancel", alCancelar);
      reject(error);
    }
  });
}

function encolarNotificacion(configuracion) {
  const tarea = colaNotificaciones.then(() =>
    abrirNotificacion(configuracion)
  );

  colaNotificaciones = tarea.catch(() => {});

  return tarea;
}

export function mostrarNotificacion({
  tipo = "informacion",
  titulo = "Notificación",
  mensaje = "",
  etiqueta,
  textoAceptar = "Aceptar",
} = {}) {
  return encolarNotificacion({
    tipo,
    titulo,
    mensaje,
    etiqueta,
    textoAceptar,
    confirmacion: false,
  });
}

export function confirmarAccion({
  titulo = "¿Estás seguro?",
  mensaje = "¿Deseas continuar con esta acción?",
  textoAceptar = "Confirmar",
  textoCancelar = "Cancelar",
} = {}) {
  return encolarNotificacion({
    tipo: "confirmacion",
    titulo,
    mensaje,
    textoAceptar,
    textoCancelar,
    confirmacion: true,
  });
}
