import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../features/auth/auth.css';

interface RegisterPageProps {
  onToggleView: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onToggleView }) => {
  const { register, error, clearError } = useAuth();
  
  // ESTADOS PARA LOS CAMPOS DEL FORMULARIO Y CONTROL DE ESTADOS DE CARGA/ERRORES
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Limpiamos los errores del contexto al montar y desmontar la pantalla de Registro
  useEffect(() => {
    clearError();
    return () => clearError();
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

      <p className="auth-switch">
        ¿Ya tienes cuenta?
        <button
          type="button"
          className="auth-switch-link"
          onClick={() => {
            clearError();
            onToggleView();
          }}
          disabled={submitting}
        >
          Inicia sesión aquí
        </button>
      </p>
    </div>
  );
};
