/// <reference types="vite/client" />

/**
 * Extensión de la interfaz ImportMetaEnv para proporcionar tipado estático
 * a las variables de entorno de Firebase utilizadas en la aplicación Vite.
 * Esto ayuda a que el autocompletado y el compilador de TypeScript reconozcan
 * las propiedades disponibles en 'import.meta.env'.
 */
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
}

/**
 * Extensión de la interfaz ImportMeta para reflejar las variables tipadas en 'env'.
 */
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
