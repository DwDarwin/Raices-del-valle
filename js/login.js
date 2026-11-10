const formLogin = document.getElementById('loginForm');

if (formLogin) {
    formLogin.addEventListener('submit', function(evento) {
        evento.preventDefault();

        const valEmail = document.getElementById('email').value.trim();
        const valPassword = document.getElementById('Contrasena').value.trim();
        
        const errorEmail = document.getElementById('errorEmail');
        const errorPassword = document.getElementById('errorPassword');

        let formularioValido = true;

        if (valEmail === "") {
            errorEmail.style.display = "block";
            formularioValido = false;
        } else {
            errorEmail.style.display = "none";
        }

        if (valPassword === "") {
            errorPassword.style.display = "block";
            formularioValido = false;
        } else {
            errorPassword.style.display = "none";
        }

        if (!formularioValido) {
            return;
        }

        const usuarios = JSON.parse(localStorage.getItem('listaUsuarios')) || [];
        const usuarioValido = usuarios.find(usuario => usuario.emailUsuario === valEmail && usuario.passwordUsuario === valPassword);

        if (usuarioValido) {
            localStorage.setItem('usuarioActivo', JSON.stringify(usuarioValido));
            alert("¡Inicio de sesión exitoso!");
            window.location.href = "../index.html";
        } else {
            alert("Usuario o contraseña inválidos. Por favor, verifica tus datos.");
        }
    });
}

const btnOjo = document.getElementById('ojo');
const inputPassword = document.getElementById('Contrasena');

if (btnOjo && inputPassword) {
    btnOjo.addEventListener('click', function() {
        if (inputPassword.type === 'password') {
            inputPassword.type = 'text';
        } else {
            inputPassword.type = 'password';
        }
    });
}