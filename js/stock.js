(function () {
  const KEY = "rdv:productos";
  const LOW_STOCK = 10; // hasta esta cantidad se considera "stock bajo"

  const CATEGORIES = [
    { key: "tuberculos", label: "Tubérculos" },
    { key: "verduras",   label: "Verduras" },
    { key: "frutas",     label: "Frutas" },
    { key: "granos",     label: "Granos" },
    { key: "granja",     label: "Granja" },
    { key: "canastas",   label: "Canastas" },
  ];

  const STATUSES = [
    { key: "publicado", label: "Publicado" },
    { key: "borrador",  label: "Borrador" },
    { key: "agotado",   label: "Agotado" },
  ];

  // Productos de ejemplo: se cargan solo la primera vez (cuando no hay nada guardado).
  function seed() {
    const rows = [
      ["Papa criolla",         "tuberculos", "Finca El Recuerdo",        16500, "canastilla 3 kg",    86, "img/papacriolla.png"],
      ["Mora de Castilla",     "frutas",     "Asociación Manos de Tierra", 8500, "canastilla 500 g",  24, "img/moracastillo.png"],
      ["Huevos de campo",      "granja",     "Granja Buena Vista",       22000, "cubeta x 30",        40, "img/huevos.png"],
      ["Fríjol cargamanto",    "granos",     "Finca La Esperanza",       12800, "bolsa 1 kg",          8, "img/frijol.png"],
      ["Papa pastusa",         "tuberculos", "Finca El Recuerdo",        19000, "canastilla 5 kg",    60, "img/papapastusa1.png"],
      ["Canasta de temporada", "canastas",   "Red Campesina Sibundoy",   48000, "selección familiar", 15, "img/canastadetemporada.png"],
      ["Arroz",                "granos",     "Finca La Esperanza",        6500, "bolsa 1 kg",        120, "img/Arroz.png"],
      ["Bananos",              "frutas",     "Asociación Manos de Tierra", 4800, "mano 1 kg",         50, "img/Bananos.png"],
      ["Cebolla larga",        "verduras",   "Finca El Recuerdo",         3500, "atado 500 g",        35, "img/cebollalarga.png"],
      ["Tomate",               "verduras",   "Granja Buena Vista",        5200, "canastilla 1 kg",    30, "img/Tomate.png"],
    ];
    return rows.map((r, i) => ({
      id: String(i + 1).padStart(4, "0"),
      name: r[0], category: r[1], producer: r[2],
      price: r[3], unit: r[4], stock: r[5], image: r[6],
      status: "publicado", description: "", createdAt: Date.now() + i,
    }));
  }

  function write(list) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
      document.dispatchEvent(new CustomEvent("productos:cambio"));
      return true;
    } catch (e) {
      return false; // almacenamiento lleno o bloqueado
    }
  }

  function getAll() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) return list;
      }
    } catch (e) { /* datos dañados: se vuelve a sembrar */ }
    const initial = seed();
    write(initial);
    return initial;
  }

  function nextId(list) {
    const max = list.reduce((m, p) => Math.max(m, parseInt(p.id, 10) || 0), 0);
    return String(max + 1).padStart(4, "0");
  }

  function add(data) {
    const list = getAll();
    const product = { ...data, id: nextId(list), createdAt: Date.now() };
    list.push(product);
    return write(list) ? product : null;
  }

  function update(id, data) {
    const list = getAll();
    const i = list.findIndex((p) => p.id === id);
    if (i === -1) return null;
    list[i] = { ...list[i], ...data, id };
    return write(list) ? list[i] : null;
  }

  function remove(id) {
    return write(getAll().filter((p) => p.id !== id));
  }

  // Estado real: tiene en cuenta el inventario.
  function effectiveStatus(p) {
    if (p.status === "borrador") return "borrador";
    if (p.status === "agotado" || Number(p.stock) <= 0) return "agotado";
    return "publicado";
  }

  // Solo lo publicado y con existencias aparece en el mercado.
  function isInShop(p) {
    return effectiveStatus(p) === "publicado";
  }

  const categoryLabel = (key) => (CATEGORIES.find((c) => c.key === key) || {}).label || key;
  const money = (n) => "$" + Number(n || 0).toLocaleString("es-CO");

  // Avisa cuando otra pestaña (por ejemplo el panel) modifica los productos.
  function onChange(cb) {
    document.addEventListener("productos:cambio", cb);
    window.addEventListener("storage", (e) => { if (e.key === KEY) cb(); });
  }

  window.RDVStore = {
    KEY, LOW_STOCK, CATEGORIES, STATUSES,
    getAll, add, update, remove,
    effectiveStatus, isInShop, categoryLabel, money, onChange,
  };
})();