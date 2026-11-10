function inicializarSesion() {
    const usuarioActivoString = localStorage.getItem('usuarioActivo');
    
    if (!usuarioActivoString) return true;

    const usuarioActivo = JSON.parse(usuarioActivoString);
    
    const partesNombre = usuarioActivo.nombreCompleto.trim().split(/\s+/);
    const primerNombre = partesNombre[0];
    let iniciales = primerNombre.charAt(0).toUpperCase();
    
    if (partesNombre.length > 1) {
        iniciales += partesNombre[1].charAt(0).toUpperCase();
    }

    const botonesPerfil = document.querySelectorAll('.profile-btn');

    if (botonesPerfil.length > 0) {
        botonesPerfil.forEach(btn => {
            btn.innerHTML = `
                <div style="width: 32px; height: 32px; background-color: var(--color-brand-accent, #e6a73d); color: var(--color-brand-primary, #102e22); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">
                    ${iniciales}
                </div>
                <span style="font-size: 13px; font-weight: 600;">Hola ${primerNombre}</span>
            `;
            
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.gap = '8px';
            
            if (btn.tagName.toLowerCase() === 'a') {
                btn.href = "#";
            }
            
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                if(confirm("¿Deseas cerrar sesión?")) {
                    localStorage.removeItem('usuarioActivo');
                    window.location.reload();
                }
            });
        });
        return true;
    }
    return false;
}

const verificador = setInterval(() => {
    if (inicializarSesion()) {
        clearInterval(verificador);
    }
}, 100);