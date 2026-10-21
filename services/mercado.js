// Mercado campesino | Raíces del Valle
// Cambia las rutas de "image" por tus fotos reales (carpeta img/).

const PRODUCTS = [
  { id: "papa-criolla",      name: "Papa criolla",         category: "tuberculos", categoryLabel: "Tubérculos", unit: "Canastilla 3 kg",    price: 16500, image: "img/papacriolla.png",        fresh: true },
  { id: "mora-castilla",     name: "Mora de Castilla",     category: "frutas",     categoryLabel: "Frutas",     unit: "Canastilla 500 g",   price: 8500,  image: "img/moracastillo.png",       fresh: true },
  { id: "huevos-campo",      name: "Huevos de campo",      category: "granja",     categoryLabel: "Granja",     unit: "Cubeta x 30",        price: 22000, image: "img/huevos.png",             fresh: true },
  { id: "frijol-cargamanto", name: "Fríjol cargamanto",    category: "granos",     categoryLabel: "Granos",     unit: "Bolsa 1 kg",         price: 12800, image: "img/frijol.png",             fresh: true },
  { id: "papa-pastusa",      name: "Papa pastusa",         category: "tuberculos", categoryLabel: "Tubérculos", unit: "Canastilla 5 kg",    price: 19000, image: "img/papapastusa1.png",       fresh: true },
  { id: "canasta-temporada", name: "Canasta de temporada", category: "canastas",   categoryLabel: "Canastas",   unit: "Selección familiar", price: 48000, image: "img/canastadetemporada.png", fresh: true },
  { id: "arroz",             name: "Arroz",                category: "granos",     categoryLabel: "Granos",     unit: "Bolsa 1 kg",         price: 6500,  image: "img/Arroz.png",              fresh: true },
  { id: "bananos",           name: "Bananos",              category: "frutas",     categoryLabel: "Frutas",     unit: "Mano 1 kg",          price: 4800,  image: "img/Bananos.png",            fresh: true },
  { id: "cebolla-larga",     name: "Cebolla larga",        category: "verduras",   categoryLabel: "Verduras",   unit: "Atado 500 g",        price: 3500,  image: "img/cebollalarga.png",       fresh: true },
  { id: "tomate",            name: "Tomate",               category: "verduras",   categoryLabel: "Verduras",   unit: "Canastilla 1 kg",    price: 5200,  image: "img/Tomate.png",             fresh: true },
];

const state = {
  category: "todos",
  sort: "recomendados",
  favorites: new Set(loadJSON("rdv:favoritos", [])),
  cart: loadJSON("rdv:carrito", {}),
};

const grid = document.getElementById("grid");
const count = document.getElementById("count");
const sortSelect = document.getElementById("sort");
const tabs = document.querySelectorAll(".tab");

const ICON_HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.2-9.2C1.8 8.4 3.4 5 6.8 5c2 0 3.5 1.1 5.2 3 1.7-1.9 3.2-3 5.2-3 3.4 0 5 3.4 4 6.3-1.7 4.6-9.2 9.2-9.2 9.2z" stroke-linejoin="round"/></svg>';
const ICON_PLUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>';
const ICON_CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* sin almacenamiento */ }
}

const formatPrice = (n) => "$" + n.toLocaleString("es-CO");

function visibleProducts() {
  const list = PRODUCTS.filter((p) => state.category === "todos" || p.category === state.category);
  switch (state.sort) {
    case "precio-asc":  return [...list].sort((a, b) => a.price - b.price);
    case "precio-desc": return [...list].sort((a, b) => b.price - a.price);
    case "nombre":      return [...list].sort((a, b) => a.name.localeCompare(b.name, "es"));
    default:            return list;
  }
}

function cardHTML(p) {
  const isFav = state.favorites.has(p.id);
  return `
    <article class="card" data-id="${p.id}">
      <div class="card__media">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'">
        ${p.fresh ? '<span class="badge">Cosecha fresca</span>' : ""}
        <button class="fav" type="button" aria-pressed="${isFav}" aria-label="Guardar ${p.name} en favoritos">${ICON_HEART}</button>
      </div>
      <div class="card__body">
        <span class="card__cat">${p.categoryLabel}</span>
        <span class="card__price">${formatPrice(p.price)}</span>
        <h3 class="card__name">${p.name}</h3>
        <p class="card__unit">${p.unit}</p>
        <button class="add" type="button" aria-label="Agregar ${p.name} al carrito">${ICON_PLUS}</button>
      </div>
    </article>`;
}

function render() {
  const list = visibleProducts();
  grid.innerHTML = list.length
    ? list.map(cardHTML).join("")
    : '<p class="empty">No hay productos en esta categoría por ahora.</p>';
  count.textContent = list.length === 1 ? "1 producto disponible" : `${list.length} productos disponibles`;
}

function cartTotal() {
  return Object.values(state.cart).reduce((sum, n) => sum + n, 0);
}

// Avisa a la cabecera: escucha el evento "carrito:cambio" o actualiza [data-cart-count].
function notifyCart() {
  const total = cartTotal();
  document.querySelectorAll("[data-cart-count]").forEach((el) => { el.textContent = total; });
  document.dispatchEvent(new CustomEvent("carrito:cambio", { detail: { total, items: state.cart } }));
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    state.category = tab.dataset.category;
    tabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", active);
    });
    render();
  });
});

sortSelect.addEventListener("change", () => {
  state.sort = sortSelect.value;
  render();
});

grid.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;
  const id = card.dataset.id;

  const favBtn = e.target.closest(".fav");
  if (favBtn) {
    state.favorites.has(id) ? state.favorites.delete(id) : state.favorites.add(id);
    favBtn.setAttribute("aria-pressed", state.favorites.has(id));
    saveJSON("rdv:favoritos", [...state.favorites]);
    return;
  }

  const addBtn = e.target.closest(".add");
  if (addBtn) {
    state.cart[id] = (state.cart[id] || 0) + 1;
    saveJSON("rdv:carrito", state.cart);
    notifyCart();
    addBtn.classList.add("is-added");
    addBtn.innerHTML = ICON_CHECK;
    setTimeout(() => {
      addBtn.classList.remove("is-added");
      addBtn.innerHTML = ICON_PLUS;
    }, 900);
  }
});

render();
notifyCart();