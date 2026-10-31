export function crearProductCard(producto) {
  return `
        <article class="product-card" data-id="${producto.id}">
            <div class="card-img-box">
                <span class="card-tag">${producto.category}</span>
                <button class="card-wishlist" aria-label="Añadir a favoritos">
                    <i class='bx bx-heart bx-sm'></i>                
                </button>
                <img src="${producto.image}" alt="${producto.name}" class="card-img" loading="lazy">
            </div>
            
            <div class="card-meta">
                <span class="card-category">${producto.category}</span>
                <span class="card-price">$ ${producto.price.toFixed(2)}</span>
            </div>
            
            <div class="card-row">
                <h3 class="card-title">${producto.name}</h3>
                <button class="card-add-btn" aria-label="Añadir al carrito">
                    <i class='bx bx-plus-circle bx-md'></i>
                    <i class='bx bxs-plus-circle bx-md add-click'></i>                          
                </button>
            </div>
            
            <span class="card-unit">${producto.unit}</span>
        </article>
    `;
}
