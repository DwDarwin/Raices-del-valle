export function campoRequerido(valor) {
  return String(valor ?? "").trim().length > 0;
}

export function correoValido(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(correo ?? "").trim());
}
