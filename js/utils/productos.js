export function obtenerListaProductos() {
  if (typeof window.leerProductos === "function") {
    try {
      const productos = window.leerProductos();
      if (Array.isArray(productos) && productos.length > 0) return productos;
    } catch (error) {
      console.warn("Fallo al leer de window.leerProductos", error);
    }
  }

  try {
    const productosGuardados = localStorage.getItem("rdv:productos");
    const productos = productosGuardados ? JSON.parse(productosGuardados) : [];
    return Array.isArray(productos) ? productos : [];
  } catch (error) {
    console.error("Error al leer rdv:productos", error);
    return [];
  }
}

export function normalizarProducto(productoOriginal) {
  const producto = productoOriginal || {};

  return {
    id: producto.id,
    name: producto.name || producto.nombre || "Producto campesino",
    category: producto.category || producto.categoria || "Tubérculos",
    price: Number(producto.price ?? producto.precio ?? 0),
    unit:
      producto.unit ||
      producto.presentacion ||
      producto.unidadVenta ||
      "unidad",
    image: producto.image || producto.imagen || "",
    description:
      producto.description ||
      producto.descripcion ||
      "Pequeña, dorada y de textura cremosa. Recolectada a mano en su punto justo para conservar todo el sabor de nuestra tierra.",
    producer: producto.producer || producto.productor || "Familia Jacanamejoy",
    tag: producto.tag || producto.etiqueta || "COSECHA FRESCA",
    gallery:
      Array.isArray(producto.gallery) && producto.gallery.length > 0
        ? producto.gallery
        : [
            producto.image || producto.imagen || "",
            "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80",
          ],
  };
}
