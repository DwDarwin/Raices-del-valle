// Panel administrativo | Raíces del Valle
// Lee y escribe los productos con js/store.js (localStorage, llave "rdv:productos").

const Store = window.RDVStore;
const PAGE_SIZE = 5;

const state = { q: "", category: "", status: "", page: 1, editingId: null, image: "" };

const $ = (id) => document.getElementById(id);
const el = {
  rows: $("rows"), results: $("results"), showing: $("showing"), pager: $("pager"),
  q: $("q"), fCat: $("f-cat"), fStatus: $("f-status"),
  navCount: $("nav-count"),
  stTotal: $("st-total"), stTotalNote: $("st-total-note"), stLow: $("st-low"), stOut: $("st-out"), stValue: $("st-value"),
  modal: $("modal"), form: $("product-form"), toast: $("toast"),
  photoPreview: $("photo-preview"), photoInput: $("photo-input"), photoBtnText: $("photo-btn-text"),
};

const ICON = (name) => `<svg class="icon"><use href="#i-${name}"/></svg>`;

// Todo lo que viene de localStorage o del formulario se escapa antes de pintarlo.
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

const normalize = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* ---------- Tabla y resumen ---------- */

function filtered(list) {
  const q = normalize(state.q.trim());
  return list.filter((p) => {
    if (state.category && p.category !== state.category) return false;
    if (state.status && Store.effectiveStatus(p) !== state.status) return false;
    if (q && !normalize(p.name + " " + p.producer).includes(q)) return false;
    return true;
  });
}

function stockInfo(p) {
  const n = Number(p.stock) || 0;
  if (n <= 0) return { cls: "is-low", note: "Sin existencias" };
  if (n <= Store.LOW_STOCK) return { cls: "is-low", note: "Stock bajo" };
  return { cls: "", note: "Disponible" };
}

function rowHTML(p) {
  const status = Store.effectiveStatus(p);
  const label = (Store.STATUSES.find((s) => s.key === status) || {}).label;
  const stock = stockInfo(p);
  const thumb = p.image
    ? `<img src="${esc(p.image)}" alt="" onerror="this.remove()">`
    : ICON("image");
  return `
    <tr data-id="${esc(p.id)}">
      <td>
        <div class="cell-product">
          <div class="thumb">${thumb}</div>
          <div>
            <strong>${esc(p.name)}</strong>
            <small>${esc(p.producer)}</small>
            <small class="id">#${esc(p.id)}</small>
          </div>
        </div>
      </td>
      <td class="cell-cat">${esc(Store.categoryLabel(p.category))}</td>
      <td class="cell-stack"><strong>${Store.money(p.price)}</strong><small>por ${esc(p.unit)}</small></td>
      <td class="cell-stack ${stock.cls}"><strong>${Number(p.stock) || 0} und.</strong><small>${stock.note}</small></td>
      <td><span class="pill pill--${status}">${label}</span></td>
      <td>
        <div class="actions">
          <a class="icon-btn" href="mercado.html" target="_blank" rel="noopener" aria-label="Ver ${esc(p.name)} en el mercado" title="Ver en el mercado">${ICON("eye")}</a>
          <button class="icon-btn" type="button" data-action="edit" aria-label="Editar ${esc(p.name)}" title="Editar">${ICON("edit")}</button>
          <button class="icon-btn icon-btn--danger" type="button" data-action="delete" aria-label="Eliminar ${esc(p.name)}" title="Eliminar">${ICON("trash")}</button>
        </div>
      </td>
    </tr>`;
}

function render() {
  const all = Store.getAll();
  const list = filtered(all);
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  state.page = Math.min(state.page, pages);
  const start = (state.page - 1) * PAGE_SIZE;
  const slice = list.slice(start, start + PAGE_SIZE);

  el.rows.innerHTML = slice.length
    ? slice.map(rowHTML).join("")
    : `<tr class="empty-row"><td colspan="6">No hay productos que coincidan con tu búsqueda.</td></tr>`;

  el.results.textContent = `${list.length} ${list.length === 1 ? "resultado" : "resultados"} en el catálogo`;
  el.showing.textContent = `Mostrando ${slice.length} de ${list.length} productos`;

  let pager = `<button type="button" data-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""}>Anterior</button>`;
  for (let i = 1; i <= pages; i++) {
    pager += `<button type="button" data-page="${i}" class="${i === state.page ? "is-current" : ""}" ${i === state.page ? 'aria-current="page"' : ""}>${i}</button>`;
  }
  pager += `<button type="button" data-page="${state.page + 1}" ${state.page === pages ? "disabled" : ""}>Siguiente</button>`;
  el.pager.innerHTML = pager;

  // Resumen: siempre sobre todo el catálogo, no sobre el filtro.
  const published = all.filter((p) => Store.effectiveStatus(p) === "publicado").length;
  const low = all.filter((p) => { const n = Number(p.stock) || 0; return n > 0 && n <= Store.LOW_STOCK && p.status !== "borrador"; }).length;
  const out = all.filter((p) => Store.effectiveStatus(p) === "agotado").length;
  const value = all.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock) || 0), 0);

  el.navCount.textContent = all.length;
  el.stTotal.textContent = all.length;
  el.stTotalNote.textContent = `${published} publicados`;
  el.stLow.textContent = low;
  el.stOut.textContent = out;
  el.stValue.textContent = "$" + Math.round(value / 1000).toLocaleString("es-CO") + "K";
}

/* ---------- Avisos ---------- */

let toastTimer;
function toast(message, isError = false) {
  el.toast.textContent = message;
  el.toast.classList.toggle("is-error", isError);
  el.toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.toast.hidden = true; }, 3200);
}

/* ---------- Formulario ---------- */

function fillSelects() {
  el.fCat.innerHTML = '<option value="">Todas las categorías</option>' +
    Store.CATEGORIES.map((c) => `<option value="${c.key}">${c.label}</option>`).join("");
  $("f-category").innerHTML = Store.CATEGORIES.map((c) => `<option value="${c.key}">${c.label}</option>`).join("");
  $("f-status-form").innerHTML = Store.STATUSES
    .slice().sort((a, b) => (a.key === "borrador" ? -1 : b.key === "borrador" ? 1 : 0))
    .map((s) => `<option value="${s.key}">${s.label}</option>`).join("");
}

function setPhoto(src) {
  state.image = src || "";
  el.photoPreview.innerHTML = src ? `<img src="${esc(src)}" alt="Vista previa">` : ICON("image");
  el.photoBtnText.textContent = src ? "Cambiar imagen" : "Subir imagen";
}

function clearErrors() {
  el.form.querySelectorAll(".error").forEach((e) => { e.textContent = ""; });
  el.form.querySelectorAll(".has-error").forEach((e) => e.classList.remove("has-error"));
}

function fieldError(id, message) {
  const err = $("err-" + id);
  if (err) err.textContent = message;
  const input = $("f-" + id);
  if (input) input.closest(".field").classList.add("has-error");
}

function openModal(product) {
  clearErrors();
  state.editingId = product ? product.id : null;
  $("modal-eyebrow").textContent = product ? "Editar producto" : "Nuevo en el catálogo";
  $("modal-title").textContent = product ? "Editar producto" : "Crear producto";
  $("modal-lede").textContent = product ? `Producto #${product.id}` : "Completa la información que verá el cliente.";
  $("submit-btn").textContent = product ? "Guardar cambios" : "Crear producto";

  $("f-name").value = product ? product.name : "";
  $("f-category").value = product ? product.category : Store.CATEGORIES[0].key;
  $("f-producer").value = product ? product.producer : "";
  $("f-price").value = product ? product.price : 0;
  $("f-unit").value = product ? product.unit : "kg";
  $("f-stock").value = product ? product.stock : 0;
  $("f-status-form").value = product ? product.status : "borrador";
  $("f-desc").value = product ? product.description || "" : "";
  el.photoInput.value = "";
  setPhoto(product ? product.image : "");

  el.modal.showModal();
  $("f-name").focus();
}

function closeModal() {
  el.modal.close();
}

// Reduce la foto antes de guardarla: localStorage tiene un límite de ~5 MB.
function resizeImage(file, maxSize = 900) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode"));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function submitForm(e) {
  e.preventDefault();
  clearErrors();

  const data = {
    name: $("f-name").value.trim(),
    category: $("f-category").value,
    producer: $("f-producer").value.trim(),
    price: Number($("f-price").value),
    unit: $("f-unit").value.trim() || "unidad",
    stock: Number($("f-stock").value),
    status: $("f-status-form").value,
    description: $("f-desc").value.trim(),
    image: state.image,
  };

  let valid = true;
  if (!data.name) { fieldError("name", "Escribe el nombre del producto."); valid = false; }
  if (!data.producer) { fieldError("producer", "Escribe el nombre del productor."); valid = false; }
  if (!Number.isFinite(data.price) || data.price < 0) { fieldError("price", "Ingresa un precio válido."); valid = false; }
  if (!Number.isInteger(data.stock) || data.stock < 0) { fieldError("stock", "El inventario debe ser un número entero."); valid = false; }
  if (!valid) return;

  const editing = state.editingId;
  const saved = editing ? Store.update(editing, data) : Store.add(data);

  if (!saved) {
    $("err-form").textContent = "No se pudo guardar: el almacenamiento del navegador está lleno. Prueba con una imagen más pequeña.";
    return;
  }

  closeModal();
  if (!editing) { state.q = ""; state.category = ""; state.status = ""; el.q.value = ""; el.fCat.value = ""; el.fStatus.value = ""; }
  render();
  toast(editing ? "Cambios guardados." : "Producto creado. Ya aparece en el catálogo.");
}

/* ---------- Exportar ---------- */

function exportCSV() {
  const header = ["ID", "Producto", "Productor", "Categoría", "Precio", "Unidad", "Inventario", "Estado"];
  const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = Store.getAll().map((p) => [
    p.id, p.name, p.producer, Store.categoryLabel(p.category), p.price, p.unit, p.stock, Store.effectiveStatus(p),
  ].map(cell).join(","));
  const csv = "﻿" + [header.map(cell).join(","), ...lines].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "productos-raices-del-valle.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------- Eventos ---------- */

$("new-btn").addEventListener("click", () => openModal(null));
$("modal-close").addEventListener("click", closeModal);
$("cancel-btn").addEventListener("click", closeModal);
el.modal.addEventListener("click", (e) => { if (e.target === el.modal) closeModal(); });
el.form.addEventListener("submit", submitForm);
$("export-btn").addEventListener("click", exportCSV);

$("photo-btn").addEventListener("click", () => el.photoInput.click());
el.photoInput.addEventListener("change", async () => {
  const file = el.photoInput.files[0];
  $("err-image").textContent = "";
  if (!file) return;
  if (!file.type.startsWith("image/")) { $("err-image").textContent = "Selecciona un archivo de imagen."; return; }
  try {
    setPhoto(await resizeImage(file));
  } catch (err) {
    $("err-image").textContent = "No se pudo leer la imagen. Prueba con otra.";
  }
});

el.q.addEventListener("input", () => { state.q = el.q.value; state.page = 1; render(); });
el.fCat.addEventListener("change", () => { state.category = el.fCat.value; state.page = 1; render(); });
el.fStatus.addEventListener("change", () => { state.status = el.fStatus.value; state.page = 1; render(); });

el.pager.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-page]");
  if (!btn || btn.disabled) return;
  state.page = Number(btn.dataset.page);
  render();
});

el.rows.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.closest("tr").dataset.id;
  const product = Store.getAll().find((p) => p.id === id);
  if (!product) return;

  if (btn.dataset.action === "edit") {
    openModal(product);
  } else if (btn.dataset.action === "delete") {
    if (window.confirm(`¿Eliminar "${product.name}"? Dejará de aparecer en el mercado.`)) {
      Store.remove(id);
      render();
      toast("Producto eliminado.");
    }
  }
});

// Menú lateral en pantallas pequeñas
const sidebar = $("sidebar"), scrim = $("scrim"), menuBtn = $("menu-btn");
function setMenu(open) {
  sidebar.classList.toggle("is-open", open);
  scrim.hidden = !open;
  menuBtn.setAttribute("aria-expanded", open);
}
menuBtn.addEventListener("click", () => setMenu(!sidebar.classList.contains("is-open")));
scrim.addEventListener("click", () => setMenu(false));

// Si el catálogo cambia desde otra pestaña, el panel se actualiza.
Store.onChange(render);

fillSelects();
render();