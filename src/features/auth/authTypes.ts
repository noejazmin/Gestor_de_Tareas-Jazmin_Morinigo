/**
 * TIPOS DE AUTENTICACIÓN:
 * Aquí definimos todas las interfaces y tipos necesarios para la autenticación de usuarios.
 * Mantener los tipos en un archivo separado ayuda a evitar dependencias circulares y a
 * garantizar un tipado estricto en toda la aplicación, evitando por completo el uso de 'any'.
 */

/**
 * Representa la estructura de un usuario autenticado de forma simplificada.
 * De esta manera no exponemos todo el objeto complejo de Firebase User
 * a la capa de presentación si no es necesario.
 */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

/**
 * Representa los campos mínimos requeridos para enviar formularios de
 * registro e inicio de sesión.
 */
export interface Credentials {
  email: string;
  password?: string;
  confirmPassword?: string;
}

/**
 * Define la estructura y métodos expuestos por el AuthContext.
 * Todos los métodos son tipados de forma estricta y retornan promesas vacías
 * o de tipo void para que la UI pueda responder a su resolución o fallo.
 */
export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (credentials: Credentials) => Promise<void>;
  register: (credentials: Credentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}
