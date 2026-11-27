export function formatearMoneda(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor) || 0);
}

export function formatearValorCompacto(valor) {
  return "$" + Math.round(Number(valor) || 0).toLocaleString("es-CO") + "K";
}

export function formatearFecha(fechaEntrada) {
  if (!fechaEntrada) return "-";

  const fecha =
    fechaEntrada instanceof Date ? fechaEntrada : new Date(fechaEntrada);

  if (Number.isNaN(fecha.getTime())) {
    return String(fechaEntrada);
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(fecha);
}
