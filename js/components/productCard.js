export function crearProductCard(producto) {
  return `
        <article class="product-card" data-id="${producto.id}">
            <div class="card-img-box">
                <span class="card-tag">${producto.tag}</span>
                <button class="card-wishlist" aria-label="Añadir a favoritos">
                    <i class='bx bx-heart bx-xs'></i>                
                </button>
                <img src="${producto.imagen}" alt="${producto.nombre}" class="card-img" loading="lazy">
            </div>
            
            <div class="card-meta">
                <span class="card-category">${producto.categoria}</span>
                <span class="card-price">${producto.precioFormat}</span>
            </div>
            
            <div class="card-row">
                <h3 class="card-title">${producto.nombre}</h3>
                <button class="card-add-btn" aria-label="Añadir al carrito">
                    <i class='bx bx-plus-circle bx-sm'></i>                    
                </button>
            </div>
            
            <span class="card-unit">${producto.unidad}</span>
        </article>
    `;
}
