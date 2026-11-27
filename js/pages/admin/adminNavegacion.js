import {
  cerrarSesion,
  obtenerSesionActiva,
} from "../../storage/sesionStorage.js";
import { obtenerRutaProyecto } from "../../utils/rutas.js";
import { el } from "./adminDomUtils.js";

export function cambiarSeccionAdmin(seccionDestino) {
  const enlaces = document.querySelectorAll(".nav a[data-seccion]");
  const vistas = document.querySelectorAll("[data-vista]");
  const topbarTitle = el("topbar-section-title");

  let enlaceActivo = null;

  enlaces.forEach((enlace) => {
    const coinciden = enlace.dataset.seccion === seccionDestino;
    enlace.classList.toggle("is-active", coinciden);

    const badge = enlace.querySelector(".badge");
    if (badge) {
      badge.classList.toggle("badge--gray", !coinciden);
    }

    if (coinciden) {
      enlaceActivo = enlace;
    }
  });

  vistas.forEach((vista) => {
    vista.hidden = vista.dataset.vista !== seccionDestino;
  });

  const tituloSeccion =
    enlaceActivo?.dataset.titulo ||
    (seccionDestino === "pedidos" ? "Pedidos" : "Inventario");

  if (topbarTitle) {
    topbarTitle.textContent = tituloSeccion;
  }

  document.title = `${tituloSeccion} | Administración Raíces del Valle`;
}

export function inicializarNavegacionAdmin() {
  const enlaces = document.querySelectorAll(".nav a[data-seccion]");

  enlaces.forEach((enlace) => {
    enlace.addEventListener("click", (evento) => {
      evento.preventDefault();
      const seccion = enlace.dataset.seccion;
      if (!seccion) return;

      cambiarSeccionAdmin(seccion);

      if (history.replaceState) {
        history.replaceState(null, "", `#${seccion}`);
      }
    });
  });

  const hashActual = window.location.hash.replace("#", "").trim();
  const params = new URLSearchParams(window.location.search);
  const seccionUrl = hashActual || params.get("seccion");

  if (
    seccionUrl &&
    document.querySelector(`[data-vista="${CSS.escape(seccionUrl)}"]`)
  ) {
    cambiarSeccionAdmin(seccionUrl);
  }
}

export function inicializarSesionAdmin() {
  const usuario = obtenerSesionActiva();
  const nombreCompleto = usuario && (usuario.nombreCompleto || usuario.nombre);

  if (nombreCompleto) {
    const nombreEl = el("admin-user-name");
    const avatarEl = el("admin-avatar");
    if (nombreEl) nombreEl.textContent = nombreCompleto;

    if (avatarEl) {
      const partes = nombreCompleto.trim().split(/\s+/);
      const iniciales =
        (partes[0] ? partes[0].charAt(0) : "A") +
        (partes[1] ? partes[1].charAt(0) : "");
      avatarEl.textContent = iniciales.toUpperCase();
    }
  }

  const botonSalir = el("logout-btn");
  if (botonSalir) {
    botonSalir.addEventListener("click", (evento) => {
      evento.preventDefault();
      if (confirm("¿Deseas cerrar sesión?")) {
        cerrarSesion();
        window.location.href = new URL(
          "pages/login.html",
          obtenerRutaProyecto(),
        ).href;
      }
    });
  }
}
