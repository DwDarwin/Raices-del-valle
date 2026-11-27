import { API_ENDPOINTS } from "../../services/api.js";
import { obtenerTokenSesion } from "../../storage/sesionStorage.js";
import { formatearMoneda } from "../../utils/formato.js";
import { obtenerRutaImagenDesdeRaiz } from "../../utils/rutas.js";
import {
  crearElemento,
  el,
  limpiarTexto,
  simplificar,
} from "./adminDomUtils.js";

export const CATEGORIAS_PRODUCTO = {
  tuberculos: "Tubérculos",
  verduras: "Verduras",
  frutas: "Frutas",
  granos: "Granos",
  granja: "Granja",
  canastas: "Canastas",
};

export const ESTADOS_PRODUCTO = {
  publicado: "Publicado",
  borrador: "Borrador",
  agotado: "Agotado",
};

const STOCK_BAJO = 10;

let listaProductos = [];
let busqueda = "";
let filtroCategoria = "";
let filtroEstado = "";
let idProductoEditando = null;
let imagenActual = "";

function construirHeadersApi() {
  const headers = { "Content-Type": "application/json" };
  const token = obtenerTokenSesion();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function adaptarProductoBackend(producto) {
  return {
    id: producto.id,
    nombre: producto.nombre || "",
    descripcion: producto.descripcion || "",
    categoria: String(producto.categoria || "tuberculos").toLowerCase(),
    productor: producto.productor || "",
    precio: Number(producto.precio) || 0,
    unidadVenta: producto.unidadVenta || "unidad",
    stock: Number(producto.stock) || 0,
    estado: String(producto.estado || "publicado").toLowerCase(),
    imagen: producto.imagen || "",
  };
}

/* ---------- Servicios API de Productos (Fuente única de verdad: Backend) ---------- */

/**
 * GET /api/productos
 * Recibe List<ProductoDTO> en español desde Spring Boot:
 * [{ id, nombre, descripcion, categoria, productor, precio, unidadVenta, stock, estado, imagen }]
 */
async function consultarProductosApi() {
  const respuesta = await fetch(API_ENDPOINTS.productos, {
    method: "GET",
    headers: construirHeadersApi(),
  });

  if (!respuesta.ok) {
    throw new Error(`Error al consultar productos: HTTP ${respuesta.status}`);
  }

  const datos = await respuesta.json();
  if (!Array.isArray(datos)) {
    throw new Error("El formato de productos recibido no es una lista");
  }

  return datos.map(adaptarProductoBackend);
}

/**
 * POST /api/productos
 * Envía ProductoDTO en español:
 * { nombre, descripcion, categoria, productor, precio, unidadVenta, stock, estado, imagen }
 */
async function crearProductoApi(productoDTO) {
  const respuesta = await fetch(API_ENDPOINTS.productos, {
    method: "POST",
    headers: construirHeadersApi(),
    body: JSON.stringify(productoDTO),
  });

  if (!respuesta.ok) {
    throw new Error(`Error al crear producto: HTTP ${respuesta.status}`);
  }

  const creado = await respuesta.json();
  return adaptarProductoBackend(creado);
}

/**
 * PUT /api/productos/{id}
 * Envía ProductoDTO en español:
 * { id, nombre, descripcion, categoria, productor, precio, unidadVenta, stock, estado, imagen }
 */
async function actualizarProductoApi(id, productoDTO) {
  const respuesta = await fetch(`${API_ENDPOINTS.productos}/${id}`, {
    method: "PUT",
    headers: construirHeadersApi(),
    body: JSON.stringify({ id, ...productoDTO }),
  });

  if (!respuesta.ok) {
    throw new Error(`Error al actualizar producto: HTTP ${respuesta.status}`);
  }

  const actualizado = await respuesta.json();
  return adaptarProductoBackend(actualizado);
}

/**
 * DELETE /api/productos/{id}
 */
async function eliminarProductoApi(id) {
  const respuesta = await fetch(`${API_ENDPOINTS.productos}/${id}`, {
    method: "DELETE",
    headers: construirHeadersApi(),
  });

  if (!respuesta.ok) {
    throw new Error(`Error al eliminar producto: HTTP ${respuesta.status}`);
  }

  return true;
}

/* ---------- Carga y Estado de Inventario ---------- */

function obtenerEstadoEfectivoProducto(producto) {
  const estado = String(producto.estado || "publicado").toLowerCase();
  if (estado === "borrador") return "borrador";
  if (estado === "agotado" || Number(producto.stock) <= 0) {
    return "agotado";
  }
  return "publicado";
}

function renderizarMensajeTablaProductos(mensaje) {
  const tbody = el("rows-productos");
  if (!tbody) return;

  tbody.replaceChildren();
  const fila = crearElemento("tr");
  const celda = crearElemento("td", "empty", mensaje);
  celda.colSpan = 6;
  fila.append(celda);
  tbody.append(fila);
}

export async function cargarProductosInventario() {
  try {
    listaProductos = await consultarProductosApi();
    renderizarInventario();
  } catch (error) {
    console.error("Error al cargar productos desde el backend:", error);
    listaProductos = [];
    if (el("nav-count")) el("nav-count").textContent = "0";
    if (el("results")) {
      el("results").textContent = "No se pudo conectar con el servidor";
    }
    renderizarMensajeTablaProductos(
      "No fue posible cargar los productos desde el servidor.",
    );
  }
}

/* ---------- Renderizado de Tabla de Productos ---------- */

function crearFilaTablaProducto(producto) {
  const estado = obtenerEstadoEfectivoProducto(producto);
  const stock = Number(producto.stock) || 0;
  let notaStock = "Disponible";
  let claseStock = "";

  if (stock <= 0) {
    notaStock = "Sin existencias";
    claseStock = "low";
  } else if (stock <= STOCK_BAJO) {
    notaStock = "Stock bajo";
    claseStock = "low";
  }

  const fila = crearElemento("tr");
  fila.dataset.id = String(producto.id);

  // 1. Producto (imagen + nombre + productor + id)
  const celdaProducto = crearElemento("td");
  const contenedorProducto = crearElemento("div", "cell-product");
  const miniatura = crearElemento("div", "thumb");

  if (producto.imagen) {
    const imagen = crearElemento("img");
    imagen.src = obtenerRutaImagenDesdeRaiz(producto.imagen);
    imagen.alt = producto.nombre;
    imagen.addEventListener("error", () => imagen.remove(), { once: true });
    miniatura.append(imagen);
  }

  const infoProducto = crearElemento("div");
  infoProducto.append(
    crearElemento("strong", "", producto.nombre),
    crearElemento("small", "", producto.productor),
    crearElemento("small", "", `ID #${producto.id}`),
  );
  contenedorProducto.append(miniatura, infoProducto);
  celdaProducto.append(contenedorProducto);

  // 2. Categoría
  const celdaCategoria = crearElemento(
    "td",
    "",
    CATEGORIAS_PRODUCTO[producto.categoria] || producto.categoria,
  );

  // 3. Precio y unidadVenta
  const celdaPrecio = crearElemento("td");
  celdaPrecio.append(
    crearElemento("strong", "", formatearMoneda(producto.precio)),
    crearElemento("small", "", `por ${producto.unidadVenta}`),
  );

  // 4. Stock
  const celdaStock = crearElemento("td", claseStock);
  celdaStock.append(
    crearElemento("strong", "", `${stock} und.`),
    crearElemento("small", "", notaStock),
  );

  // 5. Estado
  const celdaEstado = crearElemento("td");
  celdaEstado.append(
    crearElemento(
      "span",
      `pill pill--${estado}`,
      ESTADOS_PRODUCTO[estado] || producto.estado,
    ),
  );

  // 6. Acciones
  const celdaAcciones = crearElemento("td", "actions");
  const botonEditar = crearElemento("button", "", "Editar");
  botonEditar.type = "button";
  botonEditar.dataset.accion = "editar";

  const botonEliminar = crearElemento("button", "danger", "Eliminar");
  botonEliminar.type = "button";
  botonEliminar.dataset.accion = "eliminar";

  celdaAcciones.append(botonEditar, botonEliminar);

  fila.append(
    celdaProducto,
    celdaCategoria,
    celdaPrecio,
    celdaStock,
    celdaEstado,
    celdaAcciones,
  );

  return fila;
}

export function renderizarInventario() {
  const tbody = el("rows-productos");
  if (!tbody) return;

  const productosFiltrados = listaProductos.filter((producto) => {
    if (filtroCategoria && producto.categoria !== filtroCategoria) return false;
    if (
      filtroEstado &&
      obtenerEstadoEfectivoProducto(producto) !== filtroEstado
    ) {
      return false;
    }
    if (
      busqueda &&
      !simplificar(`${producto.nombre} ${producto.productor}`).includes(
        simplificar(busqueda),
      )
    ) {
      return false;
    }
    return true;
  });

  tbody.replaceChildren();

  if (productosFiltrados.length === 0) {
    renderizarMensajeTablaProductos("No hay productos que coincidan.");
  } else {
    productosFiltrados.forEach((producto) => {
      tbody.append(crearFilaTablaProducto(producto));
    });
  }

  if (el("results")) {
    el("results").textContent =
      `Mostrando ${productosFiltrados.length} de ${listaProductos.length} productos`;
  }
  if (el("nav-count")) {
    el("nav-count").textContent = String(listaProductos.length);
  }
}

/* ---------- Formulario Modal de Producto ---------- */

function llenarSelectsCategorias() {
  let opciones = "";
  for (const clave in CATEGORIAS_PRODUCTO) {
    opciones += `<option value="${clave}">${CATEGORIAS_PRODUCTO[clave]}</option>`;
  }
  if (el("f-categoria")) {
    el("f-categoria").innerHTML = opciones;
  }
  if (el("filtro-categoria")) {
    el("filtro-categoria").innerHTML =
      `<option value="">Todas las categorías</option>${opciones}`;
  }
}

function mostrarFoto(ruta) {
  imagenActual = ruta || "";
  const rutaVistaPrevia = ruta ? obtenerRutaImagenDesdeRaiz(ruta) : "";
  const contenedorPreview = el("photo-preview");
  if (!contenedorPreview) return;

  contenedorPreview.innerHTML = rutaVistaPrevia
    ? `<img src="${limpiarTexto(rutaVistaPrevia)}" alt="Vista previa">`
    : "Sin foto";
}

function limpiarErroresFormulario() {
  document.querySelectorAll(".error").forEach((elementoError) => {
    elementoError.textContent = "";
  });
}

function abrirFormularioProducto(producto) {
  limpiarErroresFormulario();
  idProductoEditando = producto ? producto.id : null;

  el("modal-eyebrow").textContent = producto
    ? "Editar producto"
    : "Nuevo en el catálogo";
  el("modal-title").textContent = producto
    ? "Editar producto"
    : "Crear producto";
  el("submit-btn").textContent = producto
    ? "Guardar cambios"
    : "Crear producto";

  el("f-nombre").value = producto ? producto.nombre : "";
  el("f-categoria").value = producto ? producto.categoria : "tuberculos";
  el("f-productor").value = producto ? producto.productor : "";
  el("f-precio").value = producto ? producto.precio : 0;
  el("f-unidad-venta").value = producto ? producto.unidadVenta : "kg";
  el("f-stock").value = producto ? producto.stock : 0;
  el("f-estado").value = producto ? producto.estado : "borrador";
  el("f-descripcion").value = producto ? producto.descripcion || "" : "";
  el("f-imagen").value = "";
  mostrarFoto(producto ? producto.imagen : "");

  el("modal-producto")?.showModal();
}

function cerrarFormularioProducto() {
  el("modal-producto")?.close();
}

function procesarCambioFotografia() {
  const archivo = el("f-imagen")?.files[0];
  el("err-imagen").textContent = "";
  if (!archivo) return;

  if (!archivo.type.startsWith("image/")) {
    el("err-imagen").textContent = "Selecciona un archivo de imagen.";
    return;
  }

  const lector = new FileReader();
  lector.onload = () => {
    const imagen = new Image();
    imagen.onload = () => {
      const escala = Math.min(1, 900 / Math.max(imagen.width, imagen.height));
      const lienzo = document.createElement("canvas");
      lienzo.width = Math.round(imagen.width * escala);
      lienzo.height = Math.round(imagen.height * escala);

      const ctx = lienzo.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, lienzo.width, lienzo.height);
      ctx.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);

      mostrarFoto(lienzo.toDataURL("image/jpeg", 0.82));
    };
    imagen.onerror = () => {
      el("err-imagen").textContent =
        "No se pudo leer la imagen. Prueba con otra.";
    };
    imagen.src = lector.result;
  };
  lector.readAsDataURL(archivo);
}

function construirProductoDTO() {
  return {
    nombre: el("f-nombre").value.trim(),
    categoria: el("f-categoria").value,
    productor: el("f-productor").value.trim(),
    precio: Number(el("f-precio").value),
    unidadVenta: el("f-unidad-venta").value.trim() || "unidad",
    stock: Number(el("f-stock").value),
    estado: el("f-estado").value,
    descripcion: el("f-descripcion").value.trim(),
    imagen: imagenActual,
  };
}

function validarProductoDTO(productoDTO) {
  let esValido = true;

  if (productoDTO.nombre === "") {
    el("err-nombre").textContent = "Escribe el nombre del producto.";
    esValido = false;
  }
  if (productoDTO.productor === "") {
    el("err-productor").textContent = "Escribe el nombre del productor.";
    esValido = false;
  }
  if (Number.isNaN(productoDTO.precio) || productoDTO.precio < 0) {
    el("err-precio").textContent = "Ingresa un precio válido.";
    esValido = false;
  }
  if (
    Number.isNaN(productoDTO.stock) ||
    productoDTO.stock < 0 ||
    productoDTO.stock % 1 !== 0
  ) {
    el("err-stock").textContent = "Ingresa un número entero.";
    esValido = false;
  }

  return esValido;
}

async function guardarProductoDesdeFormulario(evento) {
  evento.preventDefault();
  limpiarErroresFormulario();

  const productoDTO = construirProductoDTO();
  if (!validarProductoDTO(productoDTO)) return;

  const botonGuardar = el("submit-btn");
  if (botonGuardar) botonGuardar.disabled = true;

  try {
    if (idProductoEditando !== null) {
      const actualizado = await actualizarProductoApi(
        idProductoEditando,
        productoDTO,
      );
      listaProductos = listaProductos.map((item) =>
        String(item.id) === String(idProductoEditando) ? actualizado : item,
      );
    } else {
      const creado = await crearProductoApi(productoDTO);
      listaProductos.push(creado);
    }

    cerrarFormularioProducto();
    renderizarInventario();
  } catch (error) {
    console.error("Error al guardar el producto en el backend:", error);
    el("err-formulario").textContent =
      "No fue posible guardar el producto en el servidor.";
  } finally {
    if (botonGuardar) botonGuardar.disabled = false;
  }
}

async function manejarAccionFilaProducto(evento) {
  const boton = evento.target.closest("button[data-accion]");
  if (!boton) return;

  const id = boton.closest("tr")?.dataset.id;
  const producto = listaProductos.find(
    (item) => String(item.id) === String(id),
  );
  if (!producto) return;

  if (boton.dataset.accion === "editar") {
    abrirFormularioProducto(producto);
  }

  if (boton.dataset.accion === "eliminar") {
    if (
      !confirm(
        `¿Eliminar "${producto.nombre}"? Dejará de aparecer en el mercado.`,
      )
    ) {
      return;
    }

    try {
      await eliminarProductoApi(producto.id);
      listaProductos = listaProductos.filter(
        (item) => String(item.id) !== String(id),
      );
      renderizarInventario();
    } catch (error) {
      console.error("Error al eliminar el producto en el backend:", error);
      alert("No fue posible eliminar el producto en el servidor.");
    }
  }
}

export function inicializarModuloInventario() {
  llenarSelectsCategorias();

  el("form-producto")?.addEventListener(
    "submit",
    guardarProductoDesdeFormulario,
  );
  el("f-imagen")?.addEventListener("change", procesarCambioFotografia);
  el("new-btn")?.addEventListener("click", () => abrirFormularioProducto(null));
  el("modal-close")?.addEventListener("click", cerrarFormularioProducto);
  el("cancel-btn")?.addEventListener("click", cerrarFormularioProducto);

  el("q-productos")?.addEventListener("input", () => {
    busqueda = el("q-productos").value;
    renderizarInventario();
  });

  el("filtro-categoria")?.addEventListener("change", () => {
    filtroCategoria = el("filtro-categoria").value;
    renderizarInventario();
  });

  el("filtro-estado-producto")?.addEventListener("change", () => {
    filtroEstado = el("filtro-estado-producto").value;
    renderizarInventario();
  });

  el("rows-productos")?.addEventListener("click", manejarAccionFilaProducto);

  el("modal-producto")?.addEventListener("click", (evento) => {
    if (evento.target === el("modal-producto")) {
      cerrarFormularioProducto();
    }
  });

  cargarProductosInventario();
}
