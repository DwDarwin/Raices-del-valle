import {
  apiRequest,
  API_ENDPOINTS,
} from "../services/api.js";

import {
  CATEGORIAS,
  ESTADOS,
} from "../data/productosMock.js";

import {
  cerrarSesion,
  obtenerUsuario,
} from "../services/auth.js";

import {
  formatearMoneda,
} from "../utils/formato.js";
import {
  configurarRutasNavegacion,
  obtenerRutaImagenDesdeRaiz,
  obtenerRutaProyecto,
} from "../utils/rutas.js";

var busqueda = "";
var filtroCategoria = "";
var filtroEstado = "";
var idEditando = null;
var imagenActual = "";

var productos = [];


function el(id) { return document.getElementById(id); }

const STOCK_BAJO = 10;


function obtenerEstadoReal(producto) {
  if (producto.status === "borrador") return "borrador";
  if (producto.status === "agotado" || Number(producto.stock) <= 0) {
    return "agotado";
  }
  return "publicado";
}

function limpiarTexto(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function simplificar(texto) {
  return String(texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function actualizarContadorPedidos(cantidad) {
  var contadorPedidos = el("nav-orders");
  if (!contadorPedidos) return;
  var total = Number(cantidad);
  contadorPedidos.textContent = Number.isFinite(total) && total >= 0 ? total : 0;
}

function pintar() {
  var todos = productos;

  var lista = todos.filter(function (p) {
    if (filtroCategoria && p.category !== filtroCategoria) return false;
    if (filtroEstado && obtenerEstadoReal(p) !== filtroEstado) return false;
    if (busqueda && simplificar(p.name + " " + p.producer).indexOf(simplificar(busqueda)) === -1) return false;
    return true;
  });

  if (lista.length === 0) {
    el("rows").innerHTML = '<tr><td colspan="6" class="empty">No hay productos que coincidan.</td></tr>';
  } else {
    el("rows").innerHTML = lista.map(fila).join("");
  }
  el("results").textContent = "Mostrando " + lista.length + " de " + todos.length + " productos";
  el("nav-count").textContent = todos.length;
}

async function cargarProductos() {
  try {
    const respuesta = await apiRequest(API_ENDPOINTS.productos);

    console.log("Respuesta recibida del backend:", respuesta);

    if (!Array.isArray(respuesta)) {
      throw new Error(
        "La respuesta del backend no es una lista de productos."
      );
    }

    productos = respuesta.map(function (producto) {
      return {
        id: String(producto.id),
        name: producto.nombre,
        category: producto.categoria,
        producer: producto.productor,
        price: Number(producto.precio),
        unit: producto.unidadVenta,
        stock: Number(producto.stock) || 0,
        status: String(producto.estado || "")
          .trim()
          .toLowerCase(),
        description: producto.descripcion || "",
        image: producto.imagen || "",
        activo: producto.activo
      };
    });

    console.log("Productos adaptados:", productos);

    pintar();

  } catch (error) {
    console.error("Error al cargar el inventario:", error);

    el("rows").innerHTML =
      `<tr><td colspan="6" class="empty">${error.message}</td></tr>`;

    el("results").textContent = "No se pudo consultar el inventario";
    el("nav-count").textContent = "0";
  }
}

function fila(p) {
  var estado = obtenerEstadoReal(p);
  var stock = Number(p.stock) || 0;
  var nota = "Disponible";
  var claseStock = "";
  if (stock <= 0) { nota = "Sin existencias"; claseStock = "low"; }
  else if (stock <= STOCK_BAJO) { nota = "Stock bajo"; claseStock = "low"; }

  var rutaFoto = p.image ? obtenerRutaImagenDesdeRaiz(p.image) : "";
  var foto = rutaFoto ? '<img src="' + limpiarTexto(rutaFoto) + '" alt="" onerror="this.remove()">' : "";

  return '' +
    '<tr data-id="' + p.id + '">' +
    '<td>' +
    '<div class="cell-product">' +
    '<div class="thumb">' + foto + '</div>' +
    '<div><strong>' + limpiarTexto(p.name) + '</strong><small>' + limpiarTexto(p.producer) + '</small><small>#' + p.id + '</small></div>' +
    '</div>' +
    '</td>' +
    '<td>' + limpiarTexto(CATEGORIAS[p.category] || p.category) + '</td>' +
    '<td><strong>' + formatearMoneda(p.price) + '</strong><small>por ' + limpiarTexto(p.unit) + '</small></td>' +
    '<td class="' + claseStock + '"><strong>' + stock + ' und.</strong><small>' + nota + '</small></td>' +
    '<td><span class="pill pill--' + estado + '">' + ESTADOS[estado] + '</span></td>' +
    '<td class="actions">' +
    '<button type="button" data-accion="editar">Editar</button>' +
    '<button type="button" data-accion="eliminar" class="danger">Eliminar</button>' +
    '</td>' +
    '</tr>';
}

function llenarSelects() {
  var opciones = "";
  for (var clave in CATEGORIAS) {
    opciones += '<option value="' + clave + '">' + CATEGORIAS[clave] + '</option>';
  }
  el("f-category").innerHTML = opciones;
  el("f-cat").innerHTML = '<option value="">Todas las categorías</option>' + opciones;
}

function mostrarFoto(ruta) {
  imagenActual = ruta || "";
  var rutaVistaPrevia = ruta ? obtenerRutaImagenDesdeRaiz(ruta) : "";
  el("photo-preview").innerHTML = rutaVistaPrevia ? '<img src="' + limpiarTexto(rutaVistaPrevia) + '" alt="Vista previa">' : "Sin foto";
}

function limpiarErrores() {
  document.querySelectorAll(".error").forEach(function (e) { e.textContent = ""; });
}

function abrirFormulario(producto) {
  limpiarErrores();
  idEditando = producto ? producto.id : null;

  el("modal-eyebrow").textContent = producto ? "Editar producto" : "Nuevo en el catálogo";
  el("modal-title").textContent = producto ? "Editar producto" : "Crear producto";
  el("submit-btn").textContent = producto ? "Guardar cambios" : "Crear producto";

  el("f-name").value = producto ? producto.name : "";
  el("f-category").value = producto ? producto.category : "tuberculos";
  el("f-producer").value = producto ? producto.producer : "";
  el("f-price").value = producto ? producto.price : 0;
  el("f-unit").value = producto ? producto.unit : "kg";
  el("f-stock").value = producto ? producto.stock : 0;
  el("f-status-form").value = producto ? producto.status : "borrador";
  el("f-desc").value = producto ? producto.description || "" : "";
  el("photo-input").value = "";
  mostrarFoto(producto ? producto.image : "");

  el("modal").showModal();
}

function cerrarFormulario() {
  el("modal").close();
}


el("product-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  limpiarErrores();

  const datos = {
    nombre: el("f-name").value.trim(),
    categoria: el("f-category").value,
    productor: el("f-producer").value.trim(),
    precio: Number(el("f-price").value),
    unidadVenta: el("f-unit").value.trim() || "unidad",
    stock: Number(el("f-stock").value),
    estado: el("f-status-form").value,
    descripcion: el("f-desc").value.trim(),
    imagen: imagenActual
  };

  let hayError = false;

  if (datos.nombre === "") {
    el("err-name").textContent = "Escribe el nombre del producto.";
    hayError = true;
  }

  if (datos.productor === "") {
    el("err-producer").textContent = "Escribe el nombre del productor.";
    hayError = true;
  }

  if (isNaN(datos.precio) || datos.precio < 0) {
    el("err-price").textContent = "Ingresa un precio válido.";
    hayError = true;
  }

  if (isNaN(datos.stock) || datos.stock < 0 || datos.stock % 1 !== 0) {
    el("err-stock").textContent = "Ingresa un número entero.";
    hayError = true;
  }

  if (hayError) return;

  try {
    const url = idEditando
      ? `${API_ENDPOINTS.productos}/${idEditando}`
      : API_ENDPOINTS.productos;

    await apiRequest(url, {
      method: idEditando ? "PUT" : "POST",
      body: JSON.stringify(datos)
    });

    cerrarFormulario();

    await cargarProductos();

  } catch (error) {
    console.error("Error al registrar producto:", error);
    el("err-form").textContent =
      error.message || "No fue posible guardar el producto.";
  }
});

el("photo-input").addEventListener("change", function () {
  var archivo = el("photo-input").files[0];
  el("err-image").textContent = "";
  if (!archivo) return;

  if (archivo.type.indexOf("image/") !== 0) {
    el("err-image").textContent = "Selecciona un archivo de imagen.";
    return;
  }

  var lector = new FileReader();
  lector.onload = function () {
    var imagen = new Image();
    imagen.onload = function () {
      var escala = Math.min(1, 900 / Math.max(imagen.width, imagen.height));
      var lienzo = document.createElement("canvas");
      lienzo.width = Math.round(imagen.width * escala);
      lienzo.height = Math.round(imagen.height * escala);

      var ctx = lienzo.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, lienzo.width, lienzo.height);
      ctx.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);

      mostrarFoto(lienzo.toDataURL("image/jpeg", 0.82));
    };
    imagen.onerror = function () {
      el("err-image").textContent = "No se pudo leer la imagen. Prueba con otra.";
    };
    imagen.src = lector.result;
  };
  lector.readAsDataURL(archivo);
});

el("new-btn").addEventListener("click", function () { abrirFormulario(null); });
el("modal-close").addEventListener("click", cerrarFormulario);
el("cancel-btn").addEventListener("click", cerrarFormulario);

el("q").addEventListener("input", function () { busqueda = el("q").value; pintar(); });
el("f-cat").addEventListener("change", function () { filtroCategoria = el("f-cat").value; pintar(); });
el("f-status").addEventListener("change", function () { filtroEstado = el("f-status").value; pintar(); });

el("rows").addEventListener("click", async function (e) {
  var boton = e.target.closest("button[data-accion]");
  if (!boton) return;

  var id = boton.closest("tr").dataset.id;

  // Buscar el producto en los datos cargados desde el backend.
  var producto = productos.find(function (p) {
    return String(p.id) === String(id);
  });

  if (!producto) return;

  // EDITAR PRODUCTO
  if (boton.dataset.accion === "editar") {
    abrirFormulario(producto);
    return;
  }

  // ELIMINAR PRODUCTO
  if (boton.dataset.accion === "eliminar") {

    if (!confirm('¿Eliminar "' + producto.name + '"? Dejará de aparecer en el mercado.')) {
      return;
    }

    try {
      await apiRequest(`${API_ENDPOINTS.productos}/${id}`, {
        method: "DELETE"
      });

      await cargarProductos();

    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert(error.message || "No fue posible eliminar el producto.");
    }
  }
});

el("modal").addEventListener("click", function (e) {
  if (e.target === el("modal")) {
    cerrarFormulario();
  }
});


function inicializarSesionAdmin() {
  const usuario = obtenerUsuario();

  // Verificar que exista una sesión.
  if (!usuario) {
    window.location.href = new URL(
      "pages/login.html",
      obtenerRutaProyecto()
    ).href;

    return false;
  }

  // Verificar que el usuario sea administrador.
  if (usuario.rol !== "ADMIN") {
    alert("No tienes permisos para acceder al panel administrativo.");

    window.location.href = obtenerRutaProyecto().href;

    return false;
  }

  // Mostrar información del administrador.
  var nombreEl = el("admin-user-name");
  var avatarEl = el("admin-avatar");

  if (nombreEl) {
    nombreEl.textContent = usuario.nombre;
  }

  if (avatarEl) {
    var partes = usuario.nombre.trim().split(/\s+/);

    var iniciales =
      (partes[0] ? partes[0].charAt(0) : "A") +
      (partes[1] ? partes[1].charAt(0) : "");

    avatarEl.textContent = iniciales.toUpperCase();
  }

  // Cerrar sesión.
  var botonSalir = el("logout-btn");

  if (botonSalir) {
    botonSalir.addEventListener("click", function (e) {
      e.preventDefault();

      if (confirm("¿Deseas cerrar sesión?")) {
        cerrarSesion();

        window.location.href = new URL(
          "pages/login.html",
          obtenerRutaProyecto()
        ).href;
      }
    });
  }

  return true;
}


configurarRutasNavegacion(document);

if (inicializarSesionAdmin()) {
  llenarSelects();
  actualizarContadorPedidos(12);
  cargarProductos();
}