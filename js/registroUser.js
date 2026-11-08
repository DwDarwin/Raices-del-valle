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

        const nuevoUsuario = {
            nombreCompleto: valNombre,
            numeroTelefono: valTelefono,
            emailUsuario: valEmail,
            passwordUsuario: valPassword
        };

        let usuarios = JSON.parse(localStorage.getItem('listaUsuarios')) || [];
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