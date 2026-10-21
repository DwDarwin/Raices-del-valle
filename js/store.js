// store.js
// Aquí viven los datos de los productos. Lo usan mercado.html y admin.html.
// Los productos se guardan en localStorage con la llave "rdv:productos".

var CLAVE = "rdv:productos";
var STOCK_BAJO = 10; // hasta esta cantidad se considera "stock bajo"

var CATEGORIAS = {
  tuberculos: "Tubérculos",
  verduras: "Verduras",
  frutas: "Frutas",
  granos: "Granos",
  granja: "Granja",
  canastas: "Canastas"
};

var ESTADOS = {
  publicado: "Publicado",
  borrador: "Borrador",
  agotado: "Agotado"
};

// Productos de ejemplo. Solo se cargan la primera vez.
function productosIniciales() {
  return [
    { id: "0001", name: "Papa criolla",         category: "tuberculos", producer: "Finca El Recuerdo",           price: 16500, unit: "canastilla 3 kg",    stock: 86,  status: "publicado", description: "", image: "../assets/img/papacriolla.png" },
    { id: "0002", name: "Mora de Castilla",     category: "frutas",     producer: "Asociación Manos de Tierra",  price: 8500,  unit: "canastilla 500 g",   stock: 24,  status: "publicado", description: "", image: "../assets/img/moracastillo.png" },
    { id: "0003", name: "Huevos de campo",      category: "granja",     producer: "Granja Buena Vista",          price: 22000, unit: "cubeta x 30",        stock: 40,  status: "publicado", description: "", image: "../assets/img/huevos.png" },
    { id: "0004", name: "Fríjol cargamanto",    category: "granos",     producer: "Finca La Esperanza",          price: 12800, unit: "bolsa 1 kg",         stock: 8,   status: "publicado", description: "", image: "../assets/img/frijol.png" },
    { id: "0005", name: "Papa pastusa",         category: "tuberculos", producer: "Finca El Recuerdo",           price: 19000, unit: "canastilla 5 kg",    stock: 60,  status: "publicado", description: "", image: "../assets/img/papapastusa1.png" },
    { id: "0006", name: "Canasta de temporada", category: "canastas",   producer: "Red Campesina Sibundoy",      price: 48000, unit: "selección familiar", stock: 15,  status: "publicado", description: "", image: "../assets/img/canastadetemporada.png" },
    { id: "0007", name: "Arroz",                category: "granos",     producer: "Finca La Esperanza",          price: 6500,  unit: "bolsa 1 kg",         stock: 120, status: "publicado", description: "", image: "../assets/img/Arroz.png" },
    { id: "0008", name: "Bananos",              category: "frutas",     producer: "Asociación Manos de Tierra",  price: 4800,  unit: "mano 1 kg",          stock: 50,  status: "publicado", description: "", image: "../assets/img/Bananos.png" },
    { id: "0009", name: "Cebolla larga",        category: "verduras",   producer: "Finca El Recuerdo",           price: 3500,  unit: "atado 500 g",        stock: 35,  status: "publicado", description: "", image: "../assets/img/cebollalarga.png" },
    { id: "0010", name: "Tomate",               category: "verduras",   producer: "Granja Buena Vista",          price: 5200,  unit: "canastilla 1 kg",    stock: 30,  status: "publicado", description: "", image: "../assets/img/Tomate.png" }
  ];
}

// Lee la lista guardada. Si no hay nada, guarda y devuelve los de ejemplo.
function leerProductos() {
  try {
    var texto = localStorage.getItem(CLAVE);
    if (texto) {
      var lista = JSON.parse(texto);
      if (Array.isArray(lista)) return lista;
    }
  } catch (error) {
    // si los datos están dañados, se vuelve a empezar con los de ejemplo
  }
  var iniciales = productosIniciales();
  guardarProductos(iniciales);
  return iniciales;
}

// Guarda la lista. Devuelve false si el navegador no pudo guardarla (por ejemplo, está lleno).
function guardarProductos(lista) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(lista));
    return true;
  } catch (error) {
    return false;
  }
}

// Código nuevo: 0011, 0012, ...
function siguienteId(lista) {
  var mayor = 0;
  lista.forEach(function (p) {
    var numero = parseInt(p.id, 10) || 0;
    if (numero > mayor) mayor = numero;
  });
  return String(mayor + 1).padStart(4, "0");
}

// Estado real del producto: tiene en cuenta el inventario.
function estadoReal(p) {
  if (p.status === "borrador") return "borrador";
  if (p.status === "agotado" || Number(p.stock) <= 0) return "agotado";
  return "publicado";
}

// Solo lo publicado y con existencias aparece en el mercado.
function estaEnTienda(p) {
  return estadoReal(p) === "publicado";
}

function formatoPrecio(n) {
  return "$" + Number(n || 0).toLocaleString("es-CO");
}

// Evita que un texto escrito en el formulario rompa el HTML.
function limpiar(texto) {
  return String(texto == null ? "" : texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}