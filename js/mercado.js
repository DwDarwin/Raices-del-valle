
const productosIniciales = [
    {
        id: 1,
        nombre: "Papa criolla",
        categoria: "tuberculos",
        precio: 16500,
        presentacion: "Canastilla 3 kg",
        inventario: 0,
        imagen: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=700&q=80",
        recomendado: 1,
        disponible: true
    },
    {
        id: 2,
        nombre: "Mora de Castilla",
        categoria: "frutas",
        precio: 8500,
        presentacion: "Canastilla 500 g",
        inventario: 25,
        imagen: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=700&q=80",
        recomendado: 2,
        disponible: true
    },
    {
        id: 3,
        nombre: "Huevos de campo",
        categoria: "granja",
        precio: 22000,
        presentacion: "Cubeta x 30",
        inventario: 25,
        imagen: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=700&q=80",
        recomendado: 3,
        disponible: true
    },
    {
        id: 4,
        nombre: "Frijol cargamanto",
        categoria: "granos",
        precio: 12800,
        presentacion: "Bolsa 1 kg",
        inventario: 25,
        imagen: "https://png.pngtree.com/png-clipart/20240212/original/pngtree-red-beans-and-grains-packed-in-a-sack-on-a-clean-png-image_14295395.png",
        recomendado: 4,
        disponible: true
    },
    {
        id: 5,
        nombre: "Papa pastusa",
        categoria: "tuberculos",
        precio: 19000,
        presentacion: "Canastilla 5 kg",
        inventario: 25,
        imagen: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=700&q=80",
        recomendado: 5,
        disponible: true
    },
    {
        id: 6,
        nombre: "Canasta de temporada",
        categoria: "canastas",
        precio: 48000,
        presentacion: "Selección familiar",
        inventario: 25,
        imagen: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80",
        recomendado: 6,
        disponible: true
    }
];

let productos = cargarProductos();
let categoriaActiva = "todos";
let ordenActivo = "recomendados";


const categoryTabs = document.getElementById("categoryTabs");
const sortSelect = document.getElementById("sortSelect");
const productsGrid = document.getElementById("productsGrid");
const productCounter = document.getElementById("productCounter");
const emptyMessage = document.getElementById("emptyMessage");



function cargarProductos() {
    try {
        const guardados = localStorage.getItem("raicesProductos");

        if (guardados !== null) {
            const datos = JSON.parse(guardados);

            if (Array.isArray(datos)) {
                return datos;
            }
        }
    } catch (error) {
        console.error("No fue posible leer los productos:", error);
    }

    return productosIniciales;
}


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
        const disponible = producto.disponible !== false;

        const coincideCategoria =
            categoriaActiva === "todos" ||
            normalizarCategoria(producto.categoria) === categoriaActiva;

        return disponible && coincideCategoria;
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

    
    const cantidad = document.createElement("input");
    cantidad.type = "number";
    cantidad.className = "product-quantity";
    cantidad.min = "1";
    cantidad.max = String(inventario);
    cantidad.step = "1";
    cantidad.value = inventario > 0 ? "1" : "0";
    cantidad.disabled = inventario <= 0;
    cantidad.setAttribute(
        "aria-label",
        `Cantidad de ${producto.nombre}`
    );

  
    const agregar = document.createElement("button");
    agregar.className = "add-cart-btn";
    agregar.type = "button";
    agregar.textContent = "+ Carrito";
    agregar.disabled = inventario <= 0;

    agregar.addEventListener("click", () => {
        const seleccionada = Number(cantidad.value);

        if (
            !Number.isInteger(seleccionada) ||
            seleccionada < 1 ||
            seleccionada > inventario
        ) {
            alert(`Selecciona una cantidad entre 1 y ${inventario}.`);
            return;
        }

        document.dispatchEvent(
            new CustomEvent("raices:agregar-carrito", {
                detail: {
                    productoId: producto.id,
                    cantidad: seleccionada
                }
            })
        );
    });

    
    acciones.append(precio, cantidad, agregar);
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



// para actualizar desde el formulario
window.actualizarProductosCatalogo = function (nuevosProductos) {
    if (!Array.isArray(nuevosProductos)) {
        console.error("Se esperaba una lista de productos.");
        return;
    }

    productos = nuevosProductos;
    renderizarProductos();
};


//espera productos
window.addEventListener("storage", event => {
    if (event.key === "raicesProductos") {
        productos = cargarProductos();
        renderizarProductos();
    }
});




renderizarProductos();
