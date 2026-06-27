import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../features/auth/auth.css';

export const RegisterPage: React.FC = () => {
  const { register, loginWithGoogle, error, clearError } = useAuth();
  
  // ESTADOS PARA LOS CAMPOS DEL FORMULARIO Y CONTROL DE ESTADOS DE CARGA/ERRORES
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // COMENTARIO DIDÁCTICO:
  // Manejador para registrarse/iniciar sesión con Google en el registro.
  // Inhabilita la UI mientras la autenticación esté procesándose.
  const handleGoogleClick = async () => {
    setLocalError(null);
    setSubmitting(true);
    try {
      await loginWithGoogle();
    } catch {
      // El error de Firebase será capturado por el AuthProvider y seteado en el contexto.
      setSubmitting(false);
    }
  };

  // Limpiamos los errores del contexto al montar y desmontar la pantalla de Registro
  useEffect(() => {
    clearError();
    return () => clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * MANEJADOR DEL ENVÍO DE FORMULARIO:
   * Tipamos el evento como 'React.FormEvent<HTMLFormElement>'.
   * Realizamos validaciones manuales antes de enviar la petición a Firebase Auth.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    // 1. Validación de estructura de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    // 2. Validación de longitud de contraseña
    if (password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // 3. Validación de coincidencia de contraseñas
    if (password !== confirmPassword) {
      setLocalError('Las contraseñas ingresadas no coinciden.');
      return;
    }

    setSubmitting(true);
    try {
      await register({ email, password });
    } catch {
      // El error de Firebase será capturado por el AuthProvider y seteado en el contexto.
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Crear Cuenta</h2>
      <p className="auth-subtitle">Regístrate para comenzar a gestionar tareas</p>

      {/* RENDERIZADO DE ERRORES: Errores locales o de Firebase Auth */}
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
            placeholder="Mínimo 6 caracteres"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">Confirmar Contraseña</label>
          <input
            id="confirmPassword"
            type="password"
            className="form-input"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            disabled={submitting}
            placeholder="Repite tu contraseña"
            required
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={submitting}
        >
          {submitting ? <div className="spinner" /> : 'Registrarse'}
        </button>
      </form>

      {/* COMENTARIO DIDÁCTICO:
          Sección de inicio de sesión social separada por un divisor estético. */}
      <div className="auth-divider">o</div>

      <button
        type="button"
        className="btn-google"
        onClick={handleGoogleClick}
        disabled={submitting}
      >
        {submitting ? (
          <div className="spinner" style={{ borderTopColor: 'var(--text-h)' }} />
        ) : (
          <>
            <svg className="google-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Registrarse con Google
          </>
        )}
      </button>

      <p className="auth-switch">
        ¿Ya tienes cuenta?
        <Link
          to="/login"
          className="auth-switch-link"
          onClick={clearError}
        >
          Inicia sesión aquí
        </Link>
      </p>
    </div>
  );
};
