import { auth } from '../../services/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import type {
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import type { Credentials } from './authTypes';

/**
 * SERVICIOS DE AUTENTICACIÓN:
 * Encapsulan la lógica que interactúa directamente con el SDK de Firebase Authentication.
 * De esta forma, aislamos la lógica de negocio de los componentes visuales de React.
 * Todos los parámetros y retornos están estrictamente tipados sin usar 'any'.
 */

/**
 * Clase de error personalizada que simula la estructura de FirebaseError
 * para ser capturada y mapeada por 'mapAuthError' de forma segura y tipada.
 */
class CustomAuthError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    Object.setPrototypeOf(this, CustomAuthError.prototype);
  }
}

/**
 * Registra a un nuevo usuario utilizando su correo electrónico y contraseña.
 * Lanza un error si faltan las credenciales requeridas.
 */
export async function registerUser(credentials: Credentials): Promise<UserCredential> {
  const { email, password } = credentials;
  if (!email || !password) {
    throw new Error('Faltan el correo electrónico o la contraseña.');
  }
  return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Inicia sesión de un usuario existente utilizando su correo electrónico y contraseña.
 * Lanza un error si faltan las credenciales requeridas.
 * 
 * FLUJO MEJORADO DE INICIO DE SESIÓN:
 * 1. Verifica si el correo electrónico existe en Firebase con fetchSignInMethodsForEmail.
 * 2. Si no tiene métodos de inicio de sesión asociados, lanza un error auth/user-not-found.
 * 3. Si existe, procede a iniciar sesión con signInWithEmailAndPassword.
 * 4. Si la autenticación falla, traduce errores de credenciales a auth/wrong-password.
 */
export async function loginUser(credentials: Credentials): Promise<UserCredential> {
  const { email, password } = credentials;
  if (!email || !password) {
    throw new Error('Faltan el correo electrónico o la contraseña.');
  }

  let emailExists = true;
  let enumerationProtectionActive = false;

  try {
    // Verificamos métodos de inicio de sesión asociados a este correo
    const methods = await fetchSignInMethodsForEmail(auth, email);
    
    // Si la lista de métodos está vacía, el correo no está registrado
    if (methods.length === 0) {
      emailExists = false;
    }
  } catch (err: unknown) {
    // ACLARACIÓN IMPORTANTE (PROTECCIÓN CONTRA ENUMERACIÓN DE CORREOS):
    // En proyectos de Firebase creados después de septiembre de 2023, la protección de 
    // enumeración de correos está habilitada por defecto. Esto hace que fetchSignInMethodsForEmail
    // falle con 'auth/admin-restricted-operation' o siempre devuelva un array vacío/error.
    // Si esto ocurre, establecemos que la protección está activa y omitimos la validación previa.
    enumerationProtectionActive = true;
  }

  // Si pudimos verificar la ausencia del correo, lanzamos el error correspondiente
  if (!emailExists && !enumerationProtectionActive) {
    throw new CustomAuthError(
      'auth/user-not-found',
      'No existe una cuenta registrada con ese correo.'
    );
  }

  try {
    // Si el correo existe (o la protección nos impide saberlo), intentamos hacer login
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (err: unknown) {
    // Si la verificación previa fue exitosa (el correo sí existe y la protección no estaba activa)
    // entonces cualquier falla de credenciales posterior se debe a una contraseña incorrecta.
    if (!enumerationProtectionActive && typeof err === 'object' && err !== null && 'code' in err) {
      const errorCode = (err as { code: unknown }).code;
      if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/wrong-password') {
        throw new CustomAuthError(
          'auth/wrong-password',
          'La contraseña es incorrecta.'
        );
      }
    }
    
    // Si la protección está activa, lanzamos el error original (ej: auth/invalid-credential)
    // para que la UI lo maneje con el fallback genérico seguro ("El correo o la contraseña son incorrectos.")
    throw err;
  }
}

/**
 * Cierra la sesión activa del usuario actual en el dispositivo.
 */
export async function logoutUser(): Promise<void> {
  return signOut(auth);
}

/**
 * Suscribe un callback para observar los cambios en el estado de autenticación
 * (por ejemplo, cuando el usuario inicia sesión, cierra sesión o la sesión se restaura).
 * 
 * @param callback Función que recibe el objeto User de Firebase o null.
 * @returns Función de limpieza (unsubscribe) para cancelar la suscripción.
 */
export function observeAuthChanges(callback: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
