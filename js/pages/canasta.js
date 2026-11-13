import {
  obtenerCarrito,
  guardarCarrito,
  eliminarCarrito,
  CLAVE_CARRITO,
  EVENTO_CARRITO_ACTUALIZADO,
} from "../storage/carritoStorage.js";
import {
  CODIGO_DESCUENTO,
  PORCENTAJE_DESCUENTO,
  obtenerSuscripcion,
} from "../storage/suscripcionStorage.js";
import { formatearMoneda } from "../utils/formato.js";
import { obtenerRutaImagenDesdeRaiz } from "../utils/rutas.js";

const COSTO_ENVIO = 14000;

function crearElemento(tag, clase, texto) {
  const elemento = document.createElement(tag);

  if (clase) elemento.className = clase;
  if (texto !== undefined) elemento.textContent = texto;

  return elemento;
}

function generarNumeroPedido() {
  const sufijo = String(Date.now()).slice(-6);
  return `RDV-${sufijo}`;
}

function formatearFechaPedido(fecha = new Date()) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(fecha);
}

function inicializarCanasta() {
  const lista = document.getElementById("listaCanasta");
  const estadoVacio = document.getElementById("canastaVacia");
  const cantidadProductos = document.getElementById("cantidadProductos");

  const subtotalElemento = document.getElementById("subtotalCanasta");
  const envioElemento = document.getElementById("envioCanasta");
  const filaDescuento = document.getElementById("filaDescuento");
  const descuentoElemento = document.getElementById("descuentoCanasta");
  const totalElemento = document.getElementById("totalCanasta");

  const botonContinuar = document.getElementById("continuarPago");
  const modal = document.getElementById("modalFacturacion");
  const botonCerrarModal = document.getElementById("cerrarModalFacturacion");

  const ordenNumero = document.getElementById("ordenNumero");
  const ordenFecha = document.getElementById("ordenFecha");
  const ordenListaProductos = document.getElementById("ordenListaProductos");
  const ordenSubtotal = document.getElementById("ordenSubtotal");
  const ordenFilaDescuento = document.getElementById("ordenFilaDescuento");
  const ordenDescuento = document.getElementById("ordenDescuento");
  const ordenEnvio = document.getElementById("ordenEnvio");
  const ordenTotal = document.getElementById("ordenTotal");

  const botonAplicarDescuento = document.getElementById("aplicarDescuento");
  const codigoDescuento = document.getElementById("codigoDescuento");
  const mensajeDescuento = document.getElementById("mensajeDescuento");

  if (!lista || !estadoVacio) return;

  let carrito = obtenerCarrito();
  let descuentoAplicado = 0;

  function calcularTotales(items, porcentajeDescuento) {
    const unidades = items.reduce((suma, item) => suma + item.cantidad, 0);
    const subtotal = items.reduce(
      (suma, item) => suma + item.precio * item.cantidad,
      0,
    );
    const costoEnvio = items.length > 0 ? COSTO_ENVIO : 0;
    const descuento = subtotal * porcentajeDescuento;
    const total = Math.max(0, subtotal - descuento) + costoEnvio;

    return { unidades, subtotal, costoEnvio, descuento, total };
  }

  function renderizar() {
    lista.replaceChildren();

    const { unidades, subtotal, costoEnvio, descuento, total } =
      calcularTotales(carrito, descuentoAplicado);

    cantidadProductos.textContent = `${unidades} ${unidades === 1 ? "producto" : "productos"}`;

    subtotalElemento.textContent = formatearMoneda(subtotal);
    envioElemento.textContent = formatearMoneda(costoEnvio);
    filaDescuento.hidden = descuento === 0;
    descuentoElemento.textContent = `-${formatearMoneda(descuento)}`;
    totalElemento.textContent = formatearMoneda(total);

    estadoVacio.hidden = carrito.length > 0;
    lista.hidden = carrito.length === 0;
    botonContinuar.disabled = carrito.length === 0;

    carrito.forEach((item) => {
      const articulo = crearElemento("article", "canasta-item");

      const imagen = crearElemento("img", "canasta-item-imagen");
      imagen.alt = item.nombre || "Producto del mercado";

      if (item.imagen) {
        imagen.src = obtenerRutaImagenDesdeRaiz(item.imagen);

        imagen.addEventListener(
          "error",
          () => {
            imagen.hidden = true;
          },
          { once: true },
        );
      } else {
        imagen.hidden = true;
      }

      const detalle = crearElemento("div", "canasta-item-detalle");

      const categoria = crearElemento(
        "span",
        "canasta-item-categoria",
        item.categoria || "Sin categoría",
      );

      const nombre = crearElemento(
        "h2",
        "canasta-item-nombre",
        item.nombre || "Producto",
      );

      const presentacion = crearElemento(
        "span",
        "canasta-item-presentacion",
        item.unidad || "Presentación no especificada",
      );

      // Botón para eliminar individualmente el producto.
      const eliminar = crearElemento("button", "canasta-item-eliminar");

      eliminar.type = "button";
      eliminar.dataset.accion = "eliminar";
      eliminar.dataset.id = item.id;

      eliminar.setAttribute(
        "aria-label",
        `Eliminar ${item.nombre || "producto"}`,
      );

      const iconoEliminar = crearElemento("i", "bx bx-trash");

      iconoEliminar.setAttribute("aria-hidden", "true");

      eliminar.append(iconoEliminar, document.createTextNode("Eliminar"));

      detalle.append(categoria, nombre, presentacion, eliminar);

      // Controles de cantidad.
      const controles = crearElemento("div", "canasta-cantidad");

      const menos = crearElemento("button", "", "−");
      menos.type = "button";
      menos.dataset.accion = "restar";
      menos.dataset.id = item.id;

      menos.setAttribute("aria-label", `Restar una unidad de ${item.nombre}`);

      const cantidad = crearElemento("span", "", String(item.cantidad));

      const mas = crearElemento("button", "", "+");
      mas.type = "button";
      mas.dataset.accion = "sumar";
      mas.dataset.id = item.id;

      mas.setAttribute("aria-label", `Agregar una unidad de ${item.nombre}`);

      controles.append(menos, cantidad, mas);

      const precio = crearElemento(
        "strong",
        "canasta-item-subtotal",
        formatearMoneda(item.precio * item.cantidad),
      );

      articulo.append(imagen, detalle, controles, precio);

      lista.append(articulo);
    });
  }

  function renderizarDetallePedido(itemsPedido, totalesPedido) {
    if (ordenNumero) {
      ordenNumero.textContent = generarNumeroPedido();
    }

    if (ordenFecha) {
      ordenFecha.textContent = formatearFechaPedido();
    }

    if (ordenListaProductos) {
      ordenListaProductos.replaceChildren();

      itemsPedido.forEach((item) => {
        const li = crearElemento("li", "orden-item");
        const info = crearElemento("div", "orden-item-info");
        const nombre = crearElemento(
          "span",
          "orden-item-nombre",
          item.nombre || "Producto",
        );
        const detalleCantidad = crearElemento(
          "span",
          "orden-item-cantidad",
          `${item.cantidad} x ${formatearMoneda(item.precio)}${item.unidad ? ` (${item.unidad})` : ""}`,
        );
        const subtotalItem = crearElemento(
          "span",
          "orden-item-subtotal",
          formatearMoneda(item.precio * item.cantidad),
        );

        info.append(nombre, detalleCantidad);
        li.append(info, subtotalItem);
        ordenListaProductos.append(li);
      });
    }

    if (ordenSubtotal) {
      ordenSubtotal.textContent = formatearMoneda(totalesPedido.subtotal);
    }

    if (ordenFilaDescuento && ordenDescuento) {
      ordenFilaDescuento.hidden = totalesPedido.descuento === 0;
      ordenDescuento.textContent = `-${formatearMoneda(totalesPedido.descuento)}`;
    }

    if (ordenEnvio) {
      ordenEnvio.textContent = formatearMoneda(totalesPedido.costoEnvio);
    }

    if (ordenTotal) {
      ordenTotal.textContent = formatearMoneda(totalesPedido.total);
    }
  }

  function sincronizarDesdeAlmacenamiento() {
    carrito = obtenerCarrito();
    renderizar();
  }

  function actualizar() {
    if (!guardarCarrito(carrito)) {
      alert("No se pudieron guardar los cambios de tu canasta.");
    }

    renderizar();
  }

  lista.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button[data-accion]");

    if (!boton) return;

    const id = boton.dataset.id;
    const accion = boton.dataset.accion;

    const indice = carrito.findIndex((item) => String(item.id) === String(id));

    if (indice === -1) return;

    if (accion === "sumar") {
      carrito[indice].cantidad += 1;
    } else if (accion === "restar") {
      carrito[indice].cantidad -= 1;

      if (carrito[indice].cantidad <= 0) {
        carrito.splice(indice, 1);
      }
    } else if (accion === "eliminar") {
      carrito.splice(indice, 1);
    }

    actualizar();
  });

  botonContinuar.addEventListener("click", () => {
    if (carrito.length === 0) return;

    const copiaItems = carrito.map((item) => ({ ...item }));
    const totalesPedido = calcularTotales(copiaItems, descuentoAplicado);

    renderizarDetallePedido(copiaItems, totalesPedido);

    eliminarCarrito();
    carrito = [];
    descuentoAplicado = 0;

    if (codigoDescuento) {
      codigoDescuento.value = "";
    }
    if (mensajeDescuento) {
      mensajeDescuento.hidden = true;
      mensajeDescuento.textContent = "";
    }

    renderizar();

    if (typeof modal.showModal === "function") {
      modal.showModal();
    } else {
      alert(
        `¡Compra realizada con éxito! Total pagado: ${formatearMoneda(totalesPedido.total)}`,
      );
    }
  });

  botonCerrarModal.addEventListener("click", () => {
    modal.close();
  });

  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) {
      modal.close();
    }
  });

  botonAplicarDescuento.addEventListener("click", () => {
    const codigoIngresado = codigoDescuento.value.trim().toUpperCase();
    const suscripcion = obtenerSuscripcion();
    const codigoValido = (
      suscripcion?.codigoDescuento || CODIGO_DESCUENTO
    ).toUpperCase();

    if (!codigoIngresado) {
      descuentoAplicado = 0;
      mensajeDescuento.textContent = "Escribe un código para continuar.";
    } else if (
      codigoIngresado !== codigoValido &&
      codigoIngresado !== CODIGO_DESCUENTO
    ) {
      descuentoAplicado = 0;
      mensajeDescuento.textContent = "El código de descuento no es válido.";
    } else {
      descuentoAplicado = PORCENTAJE_DESCUENTO;
      codigoDescuento.value = codigoIngresado;
      mensajeDescuento.textContent =
        "Código aplicado. Tienes un 5% de descuento.";
    }

    mensajeDescuento.hidden = false;
    renderizar();
  });

  document.addEventListener(
    EVENTO_CARRITO_ACTUALIZADO,
    sincronizarDesdeAlmacenamiento,
  );

  window.addEventListener("storage", (evento) => {
    if (evento.key === CLAVE_CARRITO) {
      sincronizarDesdeAlmacenamiento();
    }
  });

  renderizar();
}

inicializarCanasta();
