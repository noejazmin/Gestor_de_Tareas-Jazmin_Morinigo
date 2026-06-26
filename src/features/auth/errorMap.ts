/**
 * MANEJO DE ERRORES:
 * Esta función traduce los códigos de error internos de Firebase Auth a mensajes
 * comprensibles y amigables en español.
 * 
 * Evitamos el uso de 'any' utilizando un protector de tipo (Type Guard)
 * para validar si un error desconocido cumple con la forma de un FirebaseError.
 */

interface FirebaseError {
  code: string;
  message?: string;
}

/**
 * Type guard que comprueba de forma segura si un valor desconocido (unknown)
 * es un error de Firebase, buscando la propiedad 'code' de tipo string.
 */
function isFirebaseError(error: unknown): error is FirebaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as Record<string, unknown>).code === 'string'
  );
}

/**
 * Traduce códigos de error comunes de Firebase Auth a mensajes en español.
 * Si el error no es de Firebase o no se reconoce, retorna un mensaje por defecto.
 */
export function mapAuthError(error: unknown): string {
  if (!isFirebaseError(error)) {
    return 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.';
  }

  switch (error.code) {
    case 'auth/invalid-email':
      return 'El correo electrónico no tiene un formato válido.';
    case 'auth/user-disabled':
      return 'Esta cuenta de usuario ha sido deshabilitada.';
    case 'auth/user-not-found':
      return 'No existe una cuenta registrada con ese correo.';
    case 'auth/wrong-password':
      return 'La contraseña es incorrecta.';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta registrada con ese correo.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Se hicieron demasiados intentos. Probá nuevamente más tarde.';
    case 'auth/invalid-credential':
      return 'El correo o la contraseña son incorrectos.';
    case 'auth/operation-not-allowed':
      return 'El método de inicio de sesión con correo y contraseña no está habilitado.';
    default:
      // Retornamos una descripción genérica en español incluyendo el código para depuración si no se mapeó
      return `Error de autenticación: ${error.code}. Por favor, vuelve a intentarlo.`;
  }
}
