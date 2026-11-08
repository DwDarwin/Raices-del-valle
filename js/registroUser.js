const formRegistro = document.getElementById('registroForm'); 

if (formRegistro) {
    formRegistro.addEventListener('submit', function(evento) {
        evento.preventDefault(); 

        const valNombre = document.getElementById('nombre').value.trim();
        const valTelefono = document.getElementById('telefono').value.trim();
        const valEmail = document.getElementById('email').value.trim();
        const valPassword = document.getElementById('password').value.trim();

        if (valNombre === "" || valTelefono === "" || valEmail === "" || valPassword === "") {
            alert("Por favor, completa todos los campos antes de continuar.");
            return; 
        }

        const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        if (!regexLetras.test(valNombre)) {
            alert("El nombre no debe contener números ni caracteres especiales.");
            return;
        }
        
        if (valNombre.split(/\s+/).length < 2) {
            alert("Por favor, ingresa al menos un nombre y un apellido.");
            return;
        }

        const regexNumeros = /^\d{10}$/; 
        if (!regexNumeros.test(valTelefono)) {
            alert("El celular debe contener exactamente 10 números, sin letras ni espacios intermedios.");
            return;
        }

        if (valPassword.length < 8) {
            alert("La contraseña debe tener al menos 8 caracteres.");
            return;
        }

        let usuarios = JSON.parse(localStorage.getItem('listaUsuarios')) || [];

        const correoExiste = usuarios.some(usuario => usuario.emailUsuario === valEmail);
        
        if (correoExiste) {
            alert("Este correo ya está registrado. Por favor, usa otro o inicia sesión.");
            return;
        }

        const nuevoUsuario = {
            nombreCompleto: valNombre,
            numeroTelefono: valTelefono,
            emailUsuario: valEmail,
            passwordUsuario: valPassword
        };

        usuarios.push(nuevoUsuario);
        localStorage.setItem('listaUsuarios', JSON.stringify(usuarios));

        alert("¡Cuenta creada con éxito! Revisa la consola y tu Local Storage.");
        console.log("Usuarios registrados:", usuarios);
        
        formRegistro.reset(); 
    });
}

const btnOjo = document.getElementById('togglePasswordBtn'); 
const inputPassword = document.getElementById('password');

if (btnOjo && inputPassword) {
    btnOjo.addEventListener('click', function() {
        if (inputPassword.type === 'password') {
            inputPassword.type = 'text';
        } else {
            inputPassword.type = 'password';
        }
    });
}