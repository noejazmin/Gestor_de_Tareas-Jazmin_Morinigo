import { auth } from '../../services/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
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
 * COMENTARIO DIDÁCTICO:
 * Se delega directamente la autenticación al SDK de Firebase para evitar la enumeración
 * de correos y cumplir con las políticas de seguridad. Los errores de credenciales inválidas,
 * usuario no encontrado o contraseña incorrecta serán capturados en la UI/Contexto
 * y mostrados bajo un único mensaje amigable.
 */
export async function loginUser(credentials: Credentials): Promise<UserCredential> {
  const { email, password } = credentials;
  if (!email || !password) {
    throw new Error('Faltan el correo electrónico o la contraseña.');
  }
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Inicia sesión o registra un usuario utilizando su cuenta de Google.
 * Abre una ventana emergente (popup) para el flujo de autenticación de Google.
 * 
 * COMENTARIO DIDÁCTICO:
 * 'GoogleAuthProvider' inicializa el proveedor de autenticación de Google y 
 * 'signInWithPopup' abre la interfaz nativa del navegador para seleccionar la cuenta.
 */
export async function loginWithGoogle(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
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
