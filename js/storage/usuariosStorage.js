export const CLAVE_USUARIOS = "listaUsuarios";

export function obtenerUsuarios() {
  try {
    const datos = localStorage.getItem(CLAVE_USUARIOS);
    return datos === null ? [] : JSON.parse(datos);
  } catch (error) {
    console.error("No se pudieron leer los usuarios:", error);
    return [];
  }
}

export function buscarUsuario(correo, contrasena) {
  return obtenerUsuarios().find(
    (usuario) =>
      usuario.emailUsuario === correo &&
      usuario.passwordUsuario === contrasena,
  );
}

export function existeUsuario(correo) {
  return obtenerUsuarios().some(
    (usuario) => usuario.emailUsuario === correo,
  );
}

export function guardarUsuario(usuario) {
  const usuarios = obtenerUsuarios();
  usuarios.push(usuario);

  try {
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
    return true;
  } catch (error) {
    console.error("No se pudo guardar el usuario:", error);
    return false;
  }
}

export function actualizarUsuario(correo, datosActualizados) {
  const usuarios = obtenerUsuarios();
  const indice = usuarios.findIndex(
    (usuario) => usuario.emailUsuario === correo,
  );

  if (indice === -1) {
    return false;
  }

  usuarios[indice] = { ...usuarios[indice], ...datosActualizados };

  try {
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
    return true;
  } catch (error) {
    console.error("No se pudo actualizar el usuario:", error);
    return false;
  }
}

export function eliminarUsuario(correo) {
  const usuarios = obtenerUsuarios();
  const usuariosRestantes = usuarios.filter(
    (usuario) => usuario.emailUsuario !== correo,
  );

  if (usuariosRestantes.length === usuarios.length) {
    return false;
  }

  try {
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuariosRestantes));
    return true;
  } catch (error) {
    console.error("No se pudo eliminar el usuario:", error);
    return false;
  }
}
