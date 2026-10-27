function adaptarProducto(producto) {
    return {
        ...producto,
        nombre: producto.name,
        categoria: producto.category,
        precio: producto.price,
        presentacion: producto.unit,
        unidadVenta: producto.unit,
        inventario: Number(producto.stock) || 0,
        imagen: producto.image,
        recomendado: Number(producto.id) || 999,
        disponible:
            producto.status === "publicado" &&
            Number(producto.stock) > 0
    };
}

let productos = window.leerProductos().map(adaptarProducto);

let categoriaActiva = "todos";
let ordenActivo = "recomendados";

const categoryTabs = document.getElementById("categoryTabs");
const sortSelect = document.getElementById("sortSelect");
const productsGrid = document.getElementById("productsGrid");
const productCounter = document.getElementById("productCounter");
const emptyMessage = document.getElementById("emptyMessage");



function formatearPrecio(precio) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(Number(precio) || 0);
}



function normalizarCategoria(categoria) {
    const valor = String(categoria ?? "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const equivalencias = {
        "tuberculo": "tuberculos",
        "tuberculos": "tuberculos",
        "fruta": "frutas",
        "frutas": "frutas",
        "grano": "granos",
        "granos": "granos",
        "granja": "granja",
        "canasta": "canastas",
        "canastas": "canastas"
    };

    return equivalencias[valor] || valor;
}


function obtenerProductosVisibles() {
    let resultado = productos.filter(producto => {
        const coincideCategoria =
            categoriaActiva === "todos" ||
            normalizarCategoria(producto.categoria) === categoriaActiva;

        return producto.disponible && coincideCategoria;
    });

    if (ordenActivo === "menor-precio") {
        resultado.sort((a, b) => Number(a.precio) - Number(b.precio));
    } else if (ordenActivo === "mayor-precio") {
        resultado.sort((a, b) => Number(b.precio) - Number(a.precio));
    } else {
        resultado.sort(
            (a, b) => Number(a.recomendado ?? 999) -
                Number(b.recomendado ?? 999)
        );
    }

    return resultado;
}


function crearTarjeta(producto) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "product-card";


    const inventario = Math.max(
        0,
        Number(producto.inventario) || 0
    );

    const unidad = producto.unidadVenta || "unidades";


    const imagen = document.createElement("img");
    imagen.className = "product-image";
    imagen.alt = producto.nombre || "Producto campesino";
    imagen.loading = "lazy";
    imagen.decoding = "async";

    if (producto.imagen) {
        imagen.src = producto.imagen;

        imagen.addEventListener("error", () => {
            imagen.removeAttribute("src");
        }, { once: true });
    }

    const imagenContenedor = document.createElement("div");
    imagenContenedor.className = "product-image-container";
    imagenContenedor.appendChild(imagen);


    const etiqueta = document.createElement("span");
    etiqueta.className = "badge-tag";
    etiqueta.textContent = producto.etiqueta || "Cosecha fresca";
    imagenContenedor.appendChild(etiqueta);


    const favorito = document.createElement("button");
    favorito.className = "wishlist-btn";
    favorito.type = "button";
    favorito.setAttribute("aria-label", "Marcar como favorito");
    favorito.setAttribute("aria-pressed", "false");
    favorito.textContent = "♡";

    favorito.addEventListener("click", () => {
        const activo =
            favorito.getAttribute("aria-pressed") !== "true";

        favorito.setAttribute("aria-pressed", String(activo));
        favorito.textContent = activo ? "♥" : "♡";
        favorito.style.color = activo ? "#eb0e0e" : "";
    });

    imagenContenedor.appendChild(favorito);


    const informacion = document.createElement("div");
    informacion.className = "product-info";

    const detalles = document.createElement("div");
    detalles.className = "product-details";

    const categoria = document.createElement("p");
    categoria.className = "product-category";
    categoria.textContent = String(producto.categoria || "")
        .replace(/-/g, " ");

    const nombre = document.createElement("h2");
    nombre.className = "product-name";
    nombre.textContent = producto.nombre || "Producto sin nombre";

    const presentacion = document.createElement("p");
    presentacion.className = "product-presentation";
    presentacion.textContent =
        producto.presentacion || `Venta por ${unidad}`;


    const disponibilidad = document.createElement("p");
    disponibilidad.className = "product-availability";

    if (inventario > 0) {
        disponibilidad.textContent =
            `Disponible: ${inventario} ${unidad}`;
    } else {
        disponibilidad.textContent = "Producto agotado";
        disponibilidad.classList.add("agotado");
    }

    detalles.append(
        categoria,
        nombre,
        presentacion,
        disponibilidad
    );


    const acciones = document.createElement("div");
    acciones.className = "product-price-action";

    const precio = document.createElement("span");
    precio.className = "product-price";
    precio.textContent = formatearPrecio(producto.precio);



    const agregar = document.createElement("button");
    agregar.className = "add-cart-btn";
    agregar.type = "button";
    agregar.textContent = "+";
    agregar.disabled = inventario <= 0;
    agregar.setAttribute(
        "aria-label",
        `Agregar ${producto.nombre} al carrito`
    );
    agregar.title = "Agregar al carrito";

    agregar.addEventListener("click", () => {
        document.dispatchEvent(
            new CustomEvent("raices:agregar-carrito", {
                detail: {
                    productoId: producto.id,
                    cantidad: 1
                }
            })
        );
    });

    acciones.append(precio, agregar);


    acciones.append(precio, agregar);
    informacion.append(detalles, acciones);
    tarjeta.append(imagenContenedor, informacion);

    return tarjeta;
}


function renderizarProductos() {
    const visibles = obtenerProductosVisibles();

    productsGrid.replaceChildren();

    const tarjetas = visibles.map(crearTarjeta);
    productsGrid.append(...tarjetas);

    const cantidad = visibles.length;

    productCounter.textContent =
        `${cantidad} producto${cantidad === 1 ? "" : "s"} disponible${cantidad === 1 ? "" : "s"}`;

    emptyMessage.hidden = cantidad !== 0;
}


categoryTabs.addEventListener("click", event => {
    const boton = event.target.closest("[data-category]");

    if (!boton || !categoryTabs.contains(boton)) {
        return;
    }

    categoriaActiva = normalizarCategoria(boton.dataset.category);

    categoryTabs.querySelectorAll(".tab-btn").forEach(tab => {
        const activo = tab === boton;

        tab.classList.toggle("active", activo);
        tab.setAttribute("aria-pressed", String(activo));
    });

    renderizarProductos();
});


sortSelect.addEventListener("change", () => {
    ordenActivo = sortSelect.value;
    renderizarProductos();
});


window.actualizarProductosCatalogo = function (nuevosProductos) {
    if (!Array.isArray(nuevosProductos)) {
        console.error("Se esperaba una lista de productos.");
        return;
    }

    productos = nuevosProductos.map(adaptarProducto);
    renderizarProductos();
};


//espera productos
window.addEventListener("storage", event => {
    if (event.key === "rdv:productos") {
        productos = window.leerProductos().map(adaptarProducto);
        renderizarProductos();
    }
});




renderizarProductos();
