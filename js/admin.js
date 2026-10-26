// Panel administrativo | Raíces del Valle
// Crea, edita y elimina productos usando las funciones de store.js.

var busqueda = "";
var filtroCategoria = "";
var filtroEstado = "";
var idEditando = null;   // null = estamos creando uno nuevo
var imagenActual = "";   // foto del formulario (ruta o dato de la imagen)

function el(id) { return document.getElementById(id); }

// Quita tildes y mayúsculas para que la búsqueda sea más flexible.
function simplificar(texto) {
  return String(texto || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/* ---------- Tabla y resumen ---------- */

function pintar() {
  var todos = leerProductos();

  // 1. Filtrar según lo que escribió o eligió la persona
  var lista = todos.filter(function (p) {
    if (filtroCategoria && p.category !== filtroCategoria) return false;
    if (filtroEstado && estadoReal(p) !== filtroEstado) return false;
    if (busqueda && simplificar(p.name + " " + p.producer).indexOf(simplificar(busqueda)) === -1) return false;
    return true;
  });

  // 2. Dibujar las filas
  if (lista.length === 0) {
    el("rows").innerHTML = '<tr><td colspan="6" class="empty">No hay productos que coincidan.</td></tr>';
  } else {
    el("rows").innerHTML = lista.map(fila).join("");
  }
  el("results").textContent = "Mostrando " + lista.length + " de " + todos.length + " productos";

  // 3. Calcular el resumen (siempre con todos los productos)
  var publicados = 0, bajos = 0, agotados = 0, valor = 0;
  todos.forEach(function (p) {
    var estado = estadoReal(p);
    var stock = Number(p.stock) || 0;
    if (estado === "publicado") publicados++;
    if (estado === "agotado") agotados++;
    if (estado !== "borrador" && stock > 0 && stock <= STOCK_BAJO) bajos++;
    valor += (Number(p.price) || 0) * stock;
  });

  el("nav-count").textContent = todos.length;
  el("st-total").textContent = todos.length;
  el("st-total-note").textContent = publicados + " publicados";
  el("st-low").textContent = bajos;
  el("st-out").textContent = agotados;
  el("st-value").textContent = "$" + Math.round(valor / 1000).toLocaleString("es-CO") + "K";
}

function fila(p) {
  var estado = estadoReal(p);
  var stock = Number(p.stock) || 0;
  var nota = "Disponible";
  var claseStock = "";
  if (stock <= 0) { nota = "Sin existencias"; claseStock = "low"; }
  else if (stock <= STOCK_BAJO) { nota = "Stock bajo"; claseStock = "low"; }

  var foto = p.image ? '<img src="' + limpiar(p.image) + '" alt="" onerror="this.remove()">' : "";

  return '' +
    '<tr data-id="' + p.id + '">' +
      '<td>' +
        '<div class="cell-product">' +
          '<div class="thumb">' + foto + '</div>' +
          '<div><strong>' + limpiar(p.name) + '</strong><small>' + limpiar(p.producer) + '</small><small>#' + p.id + '</small></div>' +
        '</div>' +
      '</td>' +
      '<td>' + limpiar(CATEGORIAS[p.category] || p.category) + '</td>' +
      '<td><strong>' + formatoPrecio(p.price) + '</strong><small>por ' + limpiar(p.unit) + '</small></td>' +
      '<td class="' + claseStock + '"><strong>' + stock + ' und.</strong><small>' + nota + '</small></td>' +
      '<td><span class="pill pill--' + estado + '">' + ESTADOS[estado] + '</span></td>' +
      '<td class="actions">' +
        '<button type="button" data-accion="editar">Editar</button>' +
        '<button type="button" data-accion="eliminar" class="danger">Eliminar</button>' +
      '</td>' +
    '</tr>';
}

/* ---------- Formulario ---------- */

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
  el("photo-preview").innerHTML = ruta ? '<img src="' + limpiar(ruta) + '" alt="Vista previa">' : "Sin foto";
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

// Guardar (crear o editar)
el("product-form").addEventListener("submit", function (e) {
  e.preventDefault();
  limpiarErrores();

  var datos = {
    name: el("f-name").value.trim(),
    category: el("f-category").value,
    producer: el("f-producer").value.trim(),
    price: Number(el("f-price").value),
    unit: el("f-unit").value.trim() || "unidad",
    stock: Number(el("f-stock").value),
    status: el("f-status-form").value,
    description: el("f-desc").value.trim(),
    image: imagenActual
  };

  // Validar
  var hayError = false;
  if (datos.name === "") { el("err-name").textContent = "Escribe el nombre del producto."; hayError = true; }
  if (datos.producer === "") { el("err-producer").textContent = "Escribe el nombre del productor."; hayError = true; }
  if (isNaN(datos.price) || datos.price < 0) { el("err-price").textContent = "Ingresa un precio válido."; hayError = true; }
  if (isNaN(datos.stock) || datos.stock < 0 || datos.stock % 1 !== 0) { el("err-stock").textContent = "Ingresa un número entero."; hayError = true; }
  if (hayError) return;

  // Crear o actualizar en la lista
  var lista = leerProductos();
  if (idEditando) {
    lista = lista.map(function (p) {
      return p.id === idEditando ? Object.assign({}, p, datos) : p;
    });
  } else {
    datos.id = siguienteId(lista);
    lista.push(datos);
  }

  if (!guardarProductos(lista)) {
    el("err-form").textContent = "No se pudo guardar: el navegador está lleno. Prueba con una imagen más pequeña.";
    return;
  }

  cerrarFormulario();
  pintar();
});

// Foto: se convierte en texto para poder guardarla en localStorage.
el("photo-input").addEventListener("change", function () {
  var archivo = el("photo-input").files[0];
  el("err-image").textContent = "";
  if (!archivo) return;

  if (archivo.type.indexOf("image/") !== 0) {
    el("err-image").textContent = "Selecciona un archivo de imagen.";
    return;
  }
  // La foto se reduce a un máximo de 900 px y se guarda como JPG liviano
  // (así no se llena el almacenamiento del navegador).
  var lector = new FileReader();
  lector.onload = function () {
    var imagen = new Image();
    imagen.onload = function () {
      var escala = Math.min(1, 900 / Math.max(imagen.width, imagen.height));
      var lienzo = document.createElement("canvas");
      lienzo.width = Math.round(imagen.width * escala);
      lienzo.height = Math.round(imagen.height * escala);

      var ctx = lienzo.getContext("2d");
      ctx.fillStyle = "#fff"; // fondo blanco por si la imagen es transparente
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

/* ---------- Eventos ---------- */

el("new-btn").addEventListener("click", function () { abrirFormulario(null); });
el("modal-close").addEventListener("click", cerrarFormulario);
el("cancel-btn").addEventListener("click", cerrarFormulario);

el("q").addEventListener("input", function () { busqueda = el("q").value; pintar(); });
el("f-cat").addEventListener("change", function () { filtroCategoria = el("f-cat").value; pintar(); });
el("f-status").addEventListener("change", function () { filtroEstado = el("f-status").value; pintar(); });

// Botones Editar / Eliminar de cada fila
el("rows").addEventListener("click", function (e) {
  var boton = e.target.closest("button[data-accion]");
  if (!boton) return;

  var id = boton.closest("tr").dataset.id;
  var lista = leerProductos();
  var producto = lista.find(function (p) { return p.id === id; });
  if (!producto) return;

  if (boton.dataset.accion === "editar") {
    abrirFormulario(producto);
  }

  if (boton.dataset.accion === "eliminar") {
    if (confirm('¿Eliminar "' + producto.name + '"? Dejará de aparecer en el mercado.')) {
      guardarProductos(lista.filter(function (p) { return p.id !== id; }));
      pintar();
    }
  }
});

llenarSelects();
pintar();