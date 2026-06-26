import { useContext } from 'react';
import { AuthContext } from '../features/auth/AuthContext';
import type { AuthContextType } from '../features/auth/authTypes';

/**
 * HOOK PERSONALIZADO useAuth:
 * Este hook encapsula el acceso al contexto de autenticación (AuthContext).
 * Permite a cualquier componente funcional consumir el estado del usuario,
 * métodos de login, register y logout de forma extremadamente limpia.
 * 
 * Si un desarrollador intenta usar useAuth() fuera de las ramas del AuthProvider,
 * la aplicación arrojará un error descriptivo en la consola inmediatamente,
 * facilitando la depuración.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser utilizado obligatoriamente dentro de un AuthProvider.');
  }
  
  return context;
}
