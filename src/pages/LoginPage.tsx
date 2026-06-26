import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../features/auth/auth.css';

interface LoginPageProps {
  onToggleView: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onToggleView }) => {
  const { login, error, clearError } = useAuth();
  
  // ESTADOS TIPADOS E INDIVIDUALES PARA EL FORMULARIO
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Limpiamos los errores globales del contexto al montar y desmontar la pantalla de Login
  useEffect(() => {
    clearError();
    return () => clearError();
  }, []);

  /**
   * CÓMO SE TIPAN LOS EVENTOS DE FORMULARIO:
   * - El evento de envío del formulario se tipa como 'React.FormEvent<HTMLFormElement>'.
   * - Los eventos de cambio en inputs se tipan como 'React.ChangeEvent<HTMLInputElement>'.
   * Evitamos usar 'any' para tener autocompletado nativo y tipado seguro en tiempo de compilación.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    // VALIDACIÓN BÁSICA LOCAL ANTES DE ENVIAR (ahorra peticiones al servidor)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    if (password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setSubmitting(true);
    try {
      await login({ email, password });
    } catch {
      // El error global se almacena en el AuthContext y se mostrará desde allí.
      // Detenemos la carga local.
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Iniciar Sesión</h2>
      <p className="auth-subtitle">Accede para gestionar tus tareas y las de tu equipo</p>

      {/* RENDERIZADO DE ERRORES: Mostramos errores locales o de Firebase */}
      {(localError || error) && (
        <div className="auth-error-alert">
          {localError || error}
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Correo Electrónico</label>
          <input
            id="email"
            type="email"
            className="form-input"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            disabled={submitting}
            placeholder="ejemplo@empresa.com"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            className="form-input"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            disabled={submitting}
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={submitting}
        >
          {submitting ? <div className="spinner" /> : 'Ingresar'}
        </button>
      </form>

      <p className="auth-switch">
        ¿No tienes cuenta?
        <button
          type="button"
          className="auth-switch-link"
          onClick={() => {
            clearError();
            onToggleView();
          }}
          disabled={submitting}
        >
          Regístrate aquí
        </button>
      </p>
    </div>
  );
};
