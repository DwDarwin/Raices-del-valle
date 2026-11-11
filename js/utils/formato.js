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
