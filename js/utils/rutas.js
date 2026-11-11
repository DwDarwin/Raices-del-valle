export function obtenerRutaProyecto() {
  if (window.location.hostname.endsWith("github.io")) {
    return new URL("/Raices-del-valle/", window.location.origin);
  }

  return new URL("../../", import.meta.url);
}

export function configurarRutasNavegacion(documento) {
  const raizProyecto = obtenerRutaProyecto();

  documento.querySelectorAll("[data-ruta]").forEach((enlace) => {
    enlace.href = new URL(enlace.dataset.ruta, raizProyecto).href;
  });
}

export function obtenerRutaImagenDesdeRaiz(rutaImagen) {
  if (!rutaImagen) return "";

  if (
    rutaImagen.startsWith("data:") ||
    rutaImagen.startsWith("blob:") ||
    rutaImagen.startsWith("http://") ||
    rutaImagen.startsWith("https://")
  ) {
    return rutaImagen;
  }

  const rutaNormalizada = rutaImagen.replace(/^(\.\.\/|\.\/|\/)+/, "");
  return new URL(rutaNormalizada, obtenerRutaProyecto()).href;
}
