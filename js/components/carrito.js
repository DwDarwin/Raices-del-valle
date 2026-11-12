import { obtenerProductos } from "../storage/productoStorage.js";
import {
  agregarProducto,
  actualizarCantidadProducto,
  eliminarProducto,
  obtenerCantidadTotal,
  obtenerCarrito,
  obtenerTotal,
  guardarCarrito,
  CLAVE_CARRITO,
  EVENTO_CARRITO_ACTUALIZADO,
} from "../storage/carritoStorage.js";
import { formatearMoneda } from "../utils/formato.js";
import {
  obtenerRutaImagenDesdeRaiz,
  obtenerRutaProyecto,
} from "../utils/rutas.js";

function obtenerProductosCatalogo() {
  return obtenerProductos();
}

export function inicializarCarrito() {
  const botonCarrito = document.getElementById("botonCarrito");
  const panelCarrito = document.getElementById("panelCarrito");
  const cerrarCarrito = document.getElementById("cerrarCarrito");
  const listaCarrito = document.getElementById("listaCarrito");
  const contadorCarrito = document.getElementById("contadorCarrito");
  const resumenCarrito = document.getElementById("resumenCarrito");
  const carritoVacio = document.getElementById("carritoVacio");
  const pieCarrito = document.getElementById("pieCarrito");
  const totalCarrito = document.getElementById("totalCarrito");
  const terminarCompra = document.getElementById("terminarCompra");
  const mensajeCarrito = document.getElementById("mensajeCarrito");

  if (!botonCarrito || !panelCarrito || !listaCarrito || !contadorCarrito) {
    return;
  }

  let carrito = obtenerCarrito();

  function mostrarMensaje(mensaje) {
    mensajeCarrito.textContent = mensaje;
    mensajeCarrito.hidden = false;
  }

  function limpiarMensaje() {
    mensajeCarrito.textContent = "";
    mensajeCarrito.hidden = true;
  }

  function abrirCarrito() {
    panelCarrito.hidden = false;
    botonCarrito.setAttribute("aria-expanded", "true");
  }

  function cerrarPanel() {
    panelCarrito.hidden = true;
    botonCarrito.setAttribute("aria-expanded", "false");
  }

  function crearElemento(tag, clase, texto) {
    const elemento = document.createElement(tag);

    if (clase) {
      elemento.className = clase;
    }

    if (texto !== undefined) {
      elemento.textContent = texto;
    }

    return elemento;
  }

  document.addEventListener(EVENTO_CARRITO_ACTUALIZADO, (evento) => {
    if (evento.detail?.origen === "carrito") {
      return;
    }

    carrito = obtenerCarrito();
    renderizarCarrito();
  });

  function renderizarCarrito() {
    listaCarrito.replaceChildren();

    const cantidadTotal = obtenerCantidadTotal(carrito);
    const total = obtenerTotal(carrito);

    contadorCarrito.textContent =
      cantidadTotal > 99 ? "99+" : String(cantidadTotal);

    botonCarrito.setAttribute(
      "aria-label",
      `Abrir carrito, ${cantidadTotal} ${
        cantidadTotal === 1 ? "producto" : "productos"
      }`,
    );

    resumenCarrito.textContent = `${cantidadTotal} ${cantidadTotal === 1 ? "producto" : "productos"}`;

    totalCarrito.textContent = formatearMoneda(total);

    carritoVacio.hidden = carrito.length > 0;
    pieCarrito.hidden = carrito.length === 0;

    carrito.forEach((item) => {
      const articulo = crearElemento("article", "carrito-item");

      const imagen = crearElemento("img", "carrito-item-imagen");
      imagen.alt = item.nombre;

      if (item.imagen) {
        imagen.src = obtenerRutaImagenDesdeRaiz(item.imagen);
      } else {
        imagen.hidden = true;
      }

      imagen.addEventListener(
        "error",
        () => {
          imagen.hidden = true;
        },
        { once: true },
      );

      const contenido = crearElemento("div", "carrito-item-contenido");

      const nombre = crearElemento("h3", "carrito-item-nombre", item.nombre);
      const encabezado = crearElemento("div", "carrito-item-encabezado");

      const botonEliminar = crearElemento("button", "carrito-eliminar");

      botonEliminar.type = "button";
      botonEliminar.dataset.accion = "eliminar";
      botonEliminar.dataset.id = item.id;
      botonEliminar.setAttribute(
        "aria-label",
        `Eliminar ${item.nombre} del carrito`,
      );
      botonEliminar.title = "Eliminar producto";

      const iconoEliminar = crearElemento("i", "bx bx-trash bx-sm");
      iconoEliminar.setAttribute("aria-hidden", "true");

      botonEliminar.append(iconoEliminar);
      encabezado.append(nombre, botonEliminar);

      const presentacion = crearElemento(
        "span",
        "carrito-item-presentacion",
        item.unidad,
      );

      const precio = crearElemento(
        "span",
        "carrito-item-precio",
        `${formatearMoneda(item.precio)}${item.unidad ? ` / ${item.unidad}` : " c/u"}`,
      );

      const final = crearElemento("div", "carrito-item-final");
      const controles = crearElemento("div", "carrito-cantidad");

      const botonMenos = crearElemento("button", "", "−");
      botonMenos.type = "button";
      botonMenos.dataset.accion = "restar";
      botonMenos.dataset.id = item.id;
      botonMenos.setAttribute(
        "aria-label",
        `Restar una unidad de ${item.nombre}`,
      );

      const cantidad = crearElemento("span", "", String(item.cantidad));

      const botonMas = crearElemento("button", "", "+");
      botonMas.type = "button";
      botonMas.dataset.accion = "sumar";
      botonMas.dataset.id = item.id;
      botonMas.setAttribute(
        "aria-label",
        `Agregar una unidad de ${item.nombre}`,
      );

      controles.append(botonMenos, cantidad, botonMas);

      const subtotal = crearElemento(
        "span",
        "carrito-item-subtotal",
        formatearMoneda(item.precio * item.cantidad),
      );

      final.append(controles, subtotal);
      contenido.append(encabezado);

      if (item.unidad) {
        contenido.append(presentacion);
      }

      contenido.append(precio, final);
      articulo.append(imagen, contenido);
      listaCarrito.append(articulo);
    });
  }

  function actualizarCarrito() {
    const panelEstabaAbierto = !panelCarrito.hidden;

    const guardado = guardarCarrito(carrito);

    renderizarCarrito();

    if (panelEstabaAbierto) {
      panelCarrito.hidden = false;
      botonCarrito.setAttribute("aria-expanded", "true");
    }

    if (!guardado) {
      mostrarMensaje(
        "No se pudo guardar el carrito en este navegador. " +
          "Tus cambios podrían perderse al recargar.",
      );
    }
  }

  function agregarProductoDesdeCatalogo(productoId, cantidad = 1) {
    const productos = obtenerProductosCatalogo();

    const productoOriginal = productos.find(
      (producto) => String(producto.id) === String(productoId),
    );

    if (!productoOriginal) {
      mostrarMensaje(
        "No encontramos ese producto en el catálogo. " +
          "Actualiza la página e inténtalo de nuevo.",
      );
      return;
    }

    limpiarMensaje();
    agregarProducto(carrito, productoOriginal, cantidad);

    actualizarCarrito();
  }

  botonCarrito.addEventListener("click", () => {
    if (panelCarrito.hidden) {
      abrirCarrito();
    } else {
      cerrarPanel();
    }
  });

  cerrarCarrito.addEventListener("click", cerrarPanel);

  listaCarrito.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button[data-accion]");

    if (!boton) {
      return;
    }

    const id = boton.dataset.id;
    const accion = boton.dataset.accion;

    if (!carrito.some((item) => String(item.id) === String(id))) {
      return;
    }

    limpiarMensaje();

    if (accion === "sumar") {
      actualizarCantidadProducto(carrito, id, 1);
    }

    if (accion === "restar") {
      actualizarCantidadProducto(carrito, id, -1);
    }

    if (accion === "eliminar") {
      carrito = eliminarProducto(carrito, id);
    }

    actualizarCarrito();
  });

  terminarCompra.addEventListener("click", () => {
    window.location.href = new URL(
      "pages/canasta.html",
      obtenerRutaProyecto(),
    ).href;
  });

  document.addEventListener("raices:agregar-carrito", (evento) => {
    const detalle = evento.detail;

    if (!detalle || detalle.productoId == null) {
      return;
    }

    agregarProductoDesdeCatalogo(
      detalle.productoId,
      Math.max(1, Math.floor(Number(detalle.cantidad) || 1)),
    );
  });

  document.addEventListener(
    "click",
    (evento) => {
      if (panelCarrito.hidden) {
        return;
      }

      const objetivo = evento.target;

      if (
        objetivo instanceof Element &&
        (objetivo.closest("#panelCarrito") || objetivo.closest("#botonCarrito"))
      ) {
        return;
      }

      cerrarPanel();
    },
    true,
  );

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && !panelCarrito.hidden) {
      cerrarPanel();
      botonCarrito.focus();
    }
  });

  window.addEventListener("storage", (evento) => {
    if (evento.key === CLAVE_CARRITO) {
      carrito = obtenerCarrito();
      renderizarCarrito();
    }
  });

  renderizarCarrito();
}
