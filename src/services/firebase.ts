/**
 * IMPORTS IMPORTANTES:
 * - 'initializeApp': Se utiliza para crear la instancia principal de la aplicación de Firebase.
 * - 'getApps': Permite verificar si ya existe alguna aplicación de Firebase inicializada en esta sesión.
 * - 'getAuth': Inicializa y nos da acceso al servicio de Autenticación de Firebase (Firebase Authentication).
 * - 'getFirestore': Inicializa y nos da acceso a la base de datos NoSQL de Firestore (Cloud Firestore).
 */
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * LECTURA DE VARIABLES DE ENTORNO:
 * Leemos las variables de entorno desde 'import.meta.env' provisto por Vite.
 * Guardamos los nombres de las variables requeridas en un arreglo tipado como constante de solo lectura
 * para poder validarlas de forma iterativa y segura.
 */
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

/**
 * VALIDACIÓN DE CONFIGURACIÓN:
 * Recorremos la lista de variables requeridas para verificar que existan en tiempo de ejecución.
 * Lanzar un error descriptivo ayuda a detectar problemas de configuración durante el desarrollo
 * de forma temprana (por ejemplo, si nos olvidamos de crear el archivo .env).
 */
for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    throw new Error(`Falta configurar ${envVar} en las variables de entorno`);
  }
}

/**
 * CONFIGURACIÓN DE FIREBASE:
 * Mapeamos las variables de entorno de Vite al formato de configuración estándar que requiere Firebase.
 * El tipado estático garantizado por 'src/vite-env.d.ts' nos asegura que los valores son de tipo string.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * INICIALIZACIÓN DE FIREBASE:
 * Durante el desarrollo con Vite, el mecanismo de Hot Module Replacement (HMR) puede recargar el archivo.
 * Si inicializáramos Firebase directamente con initializeApp(), se arrojaría un error indicando que la aplicación
 * ya ha sido creada. Con getApps() verificamos si ya existe una instancia creada; si existe la reutilizamos,
 * de lo contrario, creamos una nueva.
 */
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

/**
 * EXPORTACIÓN DE APP, AUTH Y DB:
 * Inicializamos los servicios específicos de Autenticación y Base de Datos Firestore pasando
 * nuestra aplicación configurada. Luego los exportamos para que cualquier componente o servicio
 * del proyecto pueda importarlos y usarlos directamente.
 */
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
