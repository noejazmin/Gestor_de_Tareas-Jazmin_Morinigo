/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser, Credentials, AuthContextType } from './authTypes';
import { registerUser, loginUser, logoutUser, observeAuthChanges, loginWithGoogle } from './authService';
import { mapAuthError } from './errorMap';

/**
 * ESTADO GLOBAL DE AUTENTICACIÓN:
 * Creamos el contexto que compartirá el estado del usuario por toda la aplicación.
 * Inicialmente tiene valor undefined porque solo se creará cuando el AuthProvider esté montado.
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * ¿POR QUÉ NECESITAMOS UN ESTADO DE 'loading' GLOBAL?
   * Firebase Auth tarda unos instantes en comunicarse con sus servidores al cargar o recargar
   * la aplicación para validar si ya existe un token de sesión guardado localmente (IndexedDB).
   * Si no utilizáramos un estado 'loading' e intentáramos renderizar la aplicación inmediatamente,
   * veríamos el formulario de inicio de sesión por una fracción de segundo antes de que
   * Firebase nos confirme que sí había un usuario autenticado. 
   * 'loading' en 'true' nos permite mostrar un indicador de carga agradable en lugar de una interfaz vacía o errónea.
   */
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * ¿QUÉ HACE onAuthStateChanged (observeAuthChanges)?
   * Es un observador (observer) provisto por Firebase que se dispara automáticamente cada vez
   * que cambia el estado de autenticación del usuario (inicio de sesión, registro, cierre de sesión,
   * o cuando el SDK termina de validar la sesión persistente tras una recarga de la página).
   * Al recibir el usuario de Firebase, mapeamos sus propiedades críticas a nuestro tipo 'AuthUser'
   * simplificado para mantener el desacoplamiento.
   */
  useEffect(() => {
    // Nos suscribimos al evento de cambio de sesión
    const unsubscribe = observeAuthChanges((firebaseUser) => {
      if (firebaseUser) {
        // Mapeamos los datos necesarios sin arrastrar el objeto Firebase User completo
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        });
      } else {
        setUser(null);
      }
      // Al recibir la primera respuesta de Firebase (con usuario o null), dejamos de cargar
      setLoading(false);
    });

    /**
     * ¿POR QUÉ LIMPIAMOS LA SUSCRIPCIÓN AL DESMONTAR EL COMPONENTE?
     * 'onAuthStateChanged' registra un escuchador activo en Firebase. Si el AuthProvider se desmontara
     * (por ejemplo, en sistemas de micro-frontends o reinicios de estado), y no limpiáramos este callback,
     * se generaría una fuga de memoria (memory leak) debido a llamadas a métodos del estado en componentes inexistentes.
     * Retornar 'unsubscribe' limpia la escucha activa de Firebase de manera segura.
     */
    return () => {
      unsubscribe();
    };
  }, []);

  // Limpiar el estado de error de forma manual si se requiere (ej. al cambiar de vista)
  const clearError = () => {
    setError(null);
  };

  const handleRegister = async (credentials: Credentials) => {
    setError(null);
    try {
      await registerUser(credentials);
      // El estado del usuario se actualizará automáticamente a través de observeAuthChanges
    } catch (err: unknown) {
      setError(mapAuthError(err));
      throw err; // Relanzamos para permitir que el componente del formulario sepa que falló
    }
  };

  const handleLogin = async (credentials: Credentials) => {
    setError(null);
    try {
      await loginUser(credentials);
      // El estado del usuario se actualizará automáticamente a través de observeAuthChanges
    } catch (err: unknown) {
      setError(mapAuthError(err));
      throw err; // Relanzamos para permitir que el componente del formulario sepa que falló
    }
  };

  const handleLogout = async () => {
    setError(null);
    try {
      await logoutUser();
      // El estado del usuario (user a null) se actualizará automáticamente a través de observeAuthChanges
    } catch (err: unknown) {
      setError(mapAuthError(err));
      throw err;
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await loginWithGoogle();
      // El estado del usuario se actualizará automáticamente a través de observeAuthChanges
    } catch (err: unknown) {
      const errorMessage = mapAuthError(err);
      // COMENTARIO DIDÁCTICO:
      // Si el código de error no fue mapeado específicamente en errorMap y devuelve la cadena por defecto,
      // mostramos el fallback de Google para una experiencia premium.
      if (errorMessage.startsWith('Error de autenticación:')) {
        setError('No pudimos iniciar sesión con Google. Intentá nuevamente.');
      } else {
        setError(errorMessage);
      }
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login: handleLogin,
        register: handleRegister,
        loginWithGoogle: handleGoogleLogin,
        logout: handleLogout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
