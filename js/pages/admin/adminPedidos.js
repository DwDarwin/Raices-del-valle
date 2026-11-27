import { API_ENDPOINTS } from "../../services/api.js";
import { obtenerTokenSesion } from "../../storage/sesionStorage.js";
import {
  formatearFecha,
  formatearMoneda,
} from "../../utils/formato.js";
import {
  crearElemento,
  el,
  simplificar,
} from "./adminDomUtils.js";

export const ESTADOS_PEDIDO = {
  pendiente: "Pendiente",
  preparacion: "En preparación",
  enviado: "En camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

const COSTO_ENVIO_BASE = 14000;

let listaPedidos = [];
let busquedaPedidos = "";
let filtroEstadoPedidos = "";
let filtroDescuentoPedidos = "";
let idPedidoActivoEnModal = null;

function construirHeadersApi() {
  const headers = { "Content-Type": "application/json" };
  const token = obtenerTokenSesion();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function adaptarEstadoPedido(estadoRaw) {
  const clave = String(estadoRaw || "pendiente")
    .toLowerCase()
    .trim();

  if (ESTADOS_PEDIDO[clave]) {
    return clave;
  }

  if (clave.includes("prep") || clave.includes("cosecha")) return "preparacion";
  if (
    clave.includes("env") ||
    clave.includes("camino") ||
    clave.includes("ruta")
  ) {
    return "enviado";
  }
  if (clave.includes("entreg") || clave.includes("complet")) return "entregado";
  if (clave.includes("cancel")) return "cancelado";

  return "pendiente";
}

function adaptarDetallePedidoBackend(detalle, indice = 0) {
  const cantidad = Number(detalle?.cantidad) || 0;
  const precioUnitario = Number(detalle?.precioUnitario) || 0;
  const subtotal = Number(detalle?.subtotal) || cantidad * precioUnitario;
  const producto = detalle?.producto || {};

  return {
    id: detalle?.id ?? indice + 1,
    idPedido: detalle?.idPedido,
    idProducto: detalle?.idProducto ?? producto.id ?? indice + 1,
    nombreProducto:
      detalle?.nombreProducto || producto.nombre || "Producto del mercado",
    unidadVenta: detalle?.unidadVenta || producto.unidadVenta || "",
    cantidad,
    precioUnitario,
    subtotal,
  };
}

function adaptarPedidoBackend(pedido, indice = 0) {
  const id = pedido?.id ?? indice + 1;
  const codigoPedido =
    pedido?.codigoPedido || `RDV-${String(id).padStart(6, "0")}`;
  const usuario = pedido?.usuario || {};
  const idUsuario = pedido?.idUsuario ?? usuario.id ?? "-";

  const detallesRaw = Array.isArray(pedido?.detalles) ? pedido.detalles : [];
  const detalles = detallesRaw.map(adaptarDetallePedidoBackend);

  const subtotalCalculado = detalles.reduce(
    (acumulado, item) => acumulado + item.subtotal,
    0,
  );

  const subtotal = Number(pedido?.subtotal ?? subtotalCalculado) || 0;
  const descuento = Number(pedido?.descuento) || 0;
  const total = Number(pedido?.total) || Math.max(0, subtotal - descuento);
  const costoEnvio =
    pedido?.costoEnvio !== undefined
      ? Number(pedido.costoEnvio)
      : Math.max(0, total - (subtotal - descuento)) || COSTO_ENVIO_BASE;

  return {
    id,
    codigoPedido,
    idUsuario,
    estado: adaptarEstadoPedido(pedido?.estado),
    usuario: {
      id: idUsuario,
      nombre:
        usuario.nombre ||
        pedido?.nombreUsuario ||
        "Cliente Raíces del Valle",
      documento:
        usuario.documento ||
        pedido?.documentoUsuario ||
        "No especificado",
      telefono:
        usuario.telefono ||
        pedido?.telefonoUsuario ||
        "No especificado",
      correo:
        usuario.correo ||
        pedido?.correoUsuario ||
        "-",
    },
    subtotal,
    descuento,
    costoEnvio,
    total,
    fechaPedido: pedido?.fechaPedido || new Date().toISOString(),
    detalles,
  };
}

/* ---------- Servicios API de Pedidos ---------- */

/**
 * GET /api/pedidos
 * Recibe List<PedidoResponseDTO> en español:
 * [{
 *   id,
 *   codigoPedido,
 *   idUsuario,
 *   estado,
 *   usuario: { id, nombre, documento, telefono, correo },
 *   subtotal,
 *   descuento,
 *   costoEnvio,
 *   total,
 *   fechaPedido,
 *   detalles: [{ id, idPedido, idProducto, nombreProducto, unidadVenta, cantidad, precioUnitario, subtotal }]
 * }]
 */
async function consultarPedidosApi() {
  const respuesta = await fetch(API_ENDPOINTS.pedidos, {
    method: "GET",
    headers: construirHeadersApi(),
  });

  if (!respuesta.ok) {
    throw new Error(`Error al consultar pedidos: HTTP ${respuesta.status}`);
  }

  const datos = await respuesta.json();
  if (!Array.isArray(datos)) {
    throw new Error("El formato de pedidos recibido no es una lista");
  }

  return datos.map(adaptarPedidoBackend);
}

/**
 * PATCH /api/pedidos/{id}/estado
 * Envía: { estado: "pendiente" | "preparacion" | "enviado" | "entregado" | "cancelado" }
 */
async function actualizarEstadoPedidoApi(idPedido, nuevoEstado) {
  const respuesta = await fetch(`${API_ENDPOINTS.pedidos}/${idPedido}/estado`, {
    method: "PATCH",
    headers: construirHeadersApi(),
    body: JSON.stringify({ estado: nuevoEstado }),
  });

  if (!respuesta.ok) {
    throw new Error(
      `Error al actualizar estado del pedido: HTTP ${respuesta.status}`,
    );
  }

  return true;
}

/* ---------- Carga y Gestión de Estado ---------- */

function actualizarContadorPedidos(cantidad) {
  const contadorPedidos = el("nav-orders");
  if (!contadorPedidos) return;
  const total = Number(cantidad);
  contadorPedidos.textContent =
    Number.isFinite(total) && total >= 0 ? String(total) : "0";
}

function llenarSelectsEstadoPedido() {
  let opciones = "";
  for (const clave in ESTADOS_PEDIDO) {
    opciones += `<option value="${clave}">${ESTADOS_PEDIDO[clave]}</option>`;
  }

  if (el("f-ped-estado")) {
    el("f-ped-estado").innerHTML =
      `<option value="">Todos los estados</option>${opciones}`;
  }
  if (el("det-pedido-estado-select")) {
    el("det-pedido-estado-select").innerHTML = opciones;
  }
}

function aplicarClaseSelectEstado(selectElemento, estado) {
  if (!selectElemento) return;
  selectElemento.className = `order-status-select order-status-select--${estado}`;
}

function renderizarMensajeTablaPedidos(mensaje) {
  const tbody = el("rows-pedidos");
  if (!tbody) return;

  tbody.replaceChildren();
  const fila = crearElemento("tr");
  const celda = crearElemento("td", "empty", mensaje);
  celda.colSpan = 6;
  fila.append(celda);
  tbody.append(fila);
}

export async function cargarPedidos() {
  try {
    listaPedidos = await consultarPedidosApi();
    renderizarVistaPedidos();
  } catch (error) {
    console.error("Error al cargar pedidos desde el backend:", error);
    listaPedidos = [];
    actualizarContadorPedidos(0);
    if (el("orders-results")) {
      el("orders-results").textContent = "No se pudo conectar con el servidor";
    }
    renderizarMensajeTablaPedidos(
      "No fue posible cargar los pedidos desde el servidor.",
    );
  }
}

async function cambiarEstadoDePedido(idPedido, nuevoEstado) {
  if (!ESTADOS_PEDIDO[nuevoEstado]) return;

  try {
    await actualizarEstadoPedidoApi(idPedido, nuevoEstado);
  } catch (error) {
    console.error(
      "Error al actualizar el estado del pedido en el backend:",
      error,
    );
  }

  listaPedidos = listaPedidos.map((pedido) =>
    String(pedido.id) === String(idPedido)
      ? { ...pedido, estado: nuevoEstado }
      : pedido,
  );
  renderizarVistaPedidos();

  if (
    idPedidoActivoEnModal !== null &&
    String(idPedidoActivoEnModal) === String(idPedido)
  ) {
    const selectModal = el("det-pedido-estado-select");
    if (selectModal) {
      selectModal.value = nuevoEstado;
      aplicarClaseSelectEstado(selectModal, nuevoEstado);
    }
  }
}

function coincideBusquedaPedido(pedido, termino) {
  if (!termino) return true;

  const textoProductos = pedido.detalles
    .map((detalle) => detalle.nombreProducto)
    .join(" ");

  const textoComparable = simplificar(
    `${pedido.codigoPedido} ${pedido.usuario.nombre} ${pedido.usuario.documento} ${pedido.usuario.correo} ${textoProductos}`,
  );

  return textoComparable.includes(simplificar(termino));
}

function filtrarPedidos(pedidos) {
  return pedidos.filter((pedido) => {
    if (filtroEstadoPedidos && pedido.estado !== filtroEstadoPedidos) {
      return false;
    }
    if (
      filtroDescuentoPedidos === "con-descuento" &&
      pedido.descuento <= 0
    ) {
      return false;
    }
    if (
      filtroDescuentoPedidos === "sin-descuento" &&
      pedido.descuento > 0
    ) {
      return false;
    }
    return coincideBusquedaPedido(pedido, busquedaPedidos);
  });
}

/* ---------- Renderizado de Tabla y Modal de Pedidos ---------- */

function crearSelectorEstadoFila(pedido) {
  const select = crearElemento("select");
  aplicarClaseSelectEstado(select, pedido.estado);
  select.dataset.accion = "cambiar-estado";
  select.setAttribute(
    "aria-label",
    `Cambiar estado del pedido ${pedido.codigoPedido}`,
  );

  for (const clave in ESTADOS_PEDIDO) {
    const opcion = crearElemento("option", "", ESTADOS_PEDIDO[clave]);
    opcion.value = clave;
    if (clave === pedido.estado) {
      opcion.selected = true;
    }
    select.append(opcion);
  }

  return select;
}

function crearFilaTablaPedido(pedido) {
  const fila = crearElemento("tr");
  fila.dataset.pedidoId = String(pedido.id);

  // 1. Pedido (codigoPedido + fechaPedido)
  const celdaPedido = crearElemento("td");
  celdaPedido.append(
    crearElemento("strong", "order-code", pedido.codigoPedido),
    crearElemento("small", "", formatearFecha(pedido.fechaPedido)),
  );

  // 2. Cliente (usuario.nombre + usuario.telefono)
  const celdaCliente = crearElemento("td");
  celdaCliente.append(
    crearElemento("strong", "", pedido.usuario.nombre),
    crearElemento("small", "", `Tel. ${pedido.usuario.telefono}`),
  );

  // 3. Resumen de compra (detalles)
  const totalUnidades = pedido.detalles.reduce(
    (suma, detalle) => suma + detalle.cantidad,
    0,
  );
  const resumenNombres = pedido.detalles
    .map((detalle) => `${detalle.cantidad}x ${detalle.nombreProducto}`)
    .join(", ");

  const celdaCompra = crearElemento("td", "order-items-preview");
  const listaNombres = crearElemento(
    "small",
    "",
    resumenNombres || "Sin productos",
  );
  listaNombres.title = resumenNombres;

  celdaCompra.append(
    crearElemento(
      "strong",
      "",
      `${pedido.detalles.length} ${pedido.detalles.length === 1 ? "producto" : "productos"} · ${totalUnidades} und.`,
    ),
    listaNombres,
  );

  // 4. Total (total + descuento)
  const celdaTotal = crearElemento("td");
  celdaTotal.append(crearElemento("strong", "", formatearMoneda(pedido.total)));
  if (pedido.descuento > 0) {
    celdaTotal.append(
      crearElemento(
        "small",
        "order-discount-note",
        `Cupón aplicado (-${formatearMoneda(pedido.descuento)})`,
      ),
    );
  } else {
    celdaTotal.append(crearElemento("small", "", "Precio regular"));
  }

  // 5. Estado
  const celdaEstado = crearElemento("td");
  celdaEstado.append(crearSelectorEstadoFila(pedido));

  // 6. Acciones
  const celdaAcciones = crearElemento("td", "actions");
  const botonVer = crearElemento("button", "", "Ver detalle");
  botonVer.type = "button";
  botonVer.dataset.accion = "ver-pedido";
  celdaAcciones.append(botonVer);

  fila.append(
    celdaPedido,
    celdaCliente,
    celdaCompra,
    celdaTotal,
    celdaEstado,
    celdaAcciones,
  );

  return fila;
}

function renderizarTablaPedidos(pedidosFiltrados, totalPedidos) {
  const tbody = el("rows-pedidos");
  if (!tbody) return;

  tbody.replaceChildren();

  if (pedidosFiltrados.length === 0) {
    renderizarMensajeTablaPedidos(
      "No hay pedidos que coincidan con la búsqueda.",
    );
  } else {
    pedidosFiltrados.forEach((pedido) => {
      tbody.append(crearFilaTablaPedido(pedido));
    });
  }

  if (el("orders-results")) {
    el("orders-results").textContent =
      `Mostrando ${pedidosFiltrados.length} de ${totalPedidos} pedidos`;
  }
}

export function renderizarVistaPedidos() {
  const pedidosFiltrados = filtrarPedidos(listaPedidos);
  actualizarContadorPedidos(listaPedidos.length);
  renderizarTablaPedidos(pedidosFiltrados, listaPedidos.length);
}

function crearFilaDetalleModalPedido(detalle) {
  const fila = crearElemento("tr");

  const celdaNombre = crearElemento("td");
  celdaNombre.append(crearElemento("strong", "", detalle.nombreProducto));
  if (detalle.unidadVenta) {
    celdaNombre.append(crearElemento("small", "", detalle.unidadVenta));
  }

  const celdaCantidad = crearElemento("td", "", `${detalle.cantidad} und.`);
  const celdaPrecio = crearElemento(
    "td",
    "",
    formatearMoneda(detalle.precioUnitario),
  );
  const celdaSubtotal = crearElemento("td");
  celdaSubtotal.append(
    crearElemento("strong", "", formatearMoneda(detalle.subtotal)),
  );

  fila.append(celdaNombre, celdaCantidad, celdaPrecio, celdaSubtotal);

  return fila;
}

function abrirModalDetallePedido(pedido) {
  if (!pedido) return;

  idPedidoActivoEnModal = pedido.id;

  el("modal-pedido-title").textContent = `Pedido ${pedido.codigoPedido}`;
  el("modal-pedido-fecha").textContent =
    `Realizado el ${formatearFecha(pedido.fechaPedido)}`;

  el("det-cliente-nombre").textContent = pedido.usuario.nombre;
  el("det-cliente-documento").textContent =
    `Documento: ${pedido.usuario.documento}`;
  el("det-cliente-telefono").textContent =
    `Teléfono: ${pedido.usuario.telefono}`;
  el("det-cliente-correo").textContent = `Correo: ${pedido.usuario.correo}`;

  const selectEstadoModal = el("det-pedido-estado-select");
  if (selectEstadoModal) {
    selectEstadoModal.value = pedido.estado;
    aplicarClaseSelectEstado(selectEstadoModal, pedido.estado);
  }

  const totalUnidades = pedido.detalles.reduce(
    (suma, detalle) => suma + detalle.cantidad,
    0,
  );

  el("det-pedido-items-count").textContent =
    `${pedido.detalles.length} ${pedido.detalles.length === 1 ? "producto" : "productos"} (${totalUnidades} unidades en total)`;

  const tbodyDetalles = el("det-pedido-rows");
  tbodyDetalles.replaceChildren();

  if (pedido.detalles.length === 0) {
    const filaVacia = crearElemento("tr");
    const celdaVacia = crearElemento(
      "td",
      "empty",
      "No hay productos registrados en este pedido.",
    );
    celdaVacia.colSpan = 4;
    filaVacia.append(celdaVacia);
    tbodyDetalles.append(filaVacia);
  } else {
    pedido.detalles.forEach((detalle) => {
      tbodyDetalles.append(crearFilaDetalleModalPedido(detalle));
    });
  }

  el("det-pedido-subtotal").textContent = formatearMoneda(pedido.subtotal);
  el("det-pedido-descuento").textContent =
    pedido.descuento > 0 ? `-${formatearMoneda(pedido.descuento)}` : "$ 0";
  el("det-pedido-fila-envio").hidden = pedido.costoEnvio <= 0;
  el("det-pedido-envio").textContent = formatearMoneda(pedido.costoEnvio);
  el("det-pedido-total").textContent = formatearMoneda(pedido.total);

  el("modal-pedido")?.showModal();
}

function cerrarModalDetallePedido() {
  const modalPedido = el("modal-pedido");
  idPedidoActivoEnModal = null;
  if (modalPedido && modalPedido.open) {
    modalPedido.close();
  }
}

export function inicializarModuloPedidos() {
  llenarSelectsEstadoPedido();

  el("q-pedidos")?.addEventListener("input", () => {
    busquedaPedidos = el("q-pedidos").value;
    renderizarVistaPedidos();
  });

  el("f-ped-estado")?.addEventListener("change", () => {
    filtroEstadoPedidos = el("f-ped-estado").value;
    renderizarVistaPedidos();
  });

  el("f-ped-descuento")?.addEventListener("change", () => {
    filtroDescuentoPedidos = el("f-ped-descuento").value;
    renderizarVistaPedidos();
  });

  el("rows-pedidos")?.addEventListener("click", (evento) => {
    const boton = evento.target.closest('button[data-accion="ver-pedido"]');
    if (!boton) return;
    const idPedido = boton.closest("tr")?.dataset.pedidoId;
    const pedido = listaPedidos.find(
      (item) => String(item.id) === String(idPedido),
    );
    abrirModalDetallePedido(pedido);
  });

  el("rows-pedidos")?.addEventListener("change", (evento) => {
    const select = evento.target.closest(
      'select[data-accion="cambiar-estado"]',
    );
    if (!select) return;
    const idPedido = select.closest("tr")?.dataset.pedidoId;
    cambiarEstadoDePedido(idPedido, select.value);
  });

  el("det-pedido-estado-select")?.addEventListener("change", (evento) => {
    if (idPedidoActivoEnModal === null) return;
    cambiarEstadoDePedido(idPedidoActivoEnModal, evento.target.value);
  });

  el("modal-pedido-close")?.addEventListener("click", cerrarModalDetallePedido);
  el("modal-pedido-accept")?.addEventListener(
    "click",
    cerrarModalDetallePedido,
  );
  el("modal-pedido")?.addEventListener("click", (evento) => {
    if (evento.target === el("modal-pedido")) {
      cerrarModalDetallePedido();
    }
  });

  cargarPedidos();
}
