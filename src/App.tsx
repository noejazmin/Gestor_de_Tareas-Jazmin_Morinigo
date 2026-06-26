import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import './features/auth/auth.css';
import './App.css';

/**
 * COMPONENTE PRINCIPAL (App.tsx):
 * Controla el flujo de vistas principal del Hito 3.
 * 
 * - Si Firebase está validando la sesión guardada en IndexedDB ('loading' en true),
 *   muestra un indicador de carga para evitar saltos bruscos en la UI.
 * - Si hay un usuario logueado ('user' existe), renderiza un panel de bienvenida
 *   con el correo electrónico de la sesión activa y el botón de Cerrar Sesión (logout).
 * - Si no hay un usuario logueado, renderiza condicionalmente el formulario de Login
 *   o el de Registro según un estado local simple ('view').
 */
function App() {
  const { user, loading, logout } = useAuth();
  const [view, setView] = useState<'login' | 'register'>('login');

  // Vista de espera mientras se restaura la sesión persistente
  if (loading) {
    return (
      <main className="app-container">
        <header className="app-header">
          <span className="badge">Validando Sesión</span>
          <h1>Gestor de Tareas</h1>
        </header>
        <section className="status-section">
          <div className="status-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px' }}>
            <h3 style={{ marginBottom: '20px' }}>Cargando datos de usuario...</h3>
            <div className="spinner" style={{ borderTopColor: 'var(--accent)', borderWidth: '4px', width: '32px', height: '32px' }} />
          </div>
        </section>
        <footer className="app-footer">
          <p>Proyecto Integrador 4</p>
        </footer>
      </main>
    );
  }

  return (
    <main className="app-container">
      <header className="app-header">
        <span className="badge">Hito 3: Autenticación</span>
        <h1>Gestor de Tareas</h1>
        <p className="subtitle">
          Sistema de Gestión de Tareas para Empleados - PI4
        </p>
      </header>

      <section className="status-section">
        {user ? (
          /* VISTA DEL USUARIO AUTENTICADO */
          <div className="status-card" style={{ maxWidth: '420px', margin: '0 auto' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span className="icon" style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>✓</span>
              Sesión Activa
            </h3>
            <p style={{ margin: '0 0 20px 0' }}>
              Has ingresado correctamente. Tu sesión es persistente incluso si cierras el navegador o refrescas la página.
            </p>
            
            <div style={{
              background: 'var(--code-bg)',
              padding: '16px',
              borderRadius: '10px',
              marginBottom: '24px',
              border: '1px solid var(--border)',
              wordBreak: 'break-all'
            }}>
              <strong style={{ color: 'var(--text-h)', display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Usuario Conectado
              </strong>
              <span style={{ fontSize: '15px', color: 'var(--accent)', fontWeight: '600' }}>
                {user.email}
              </span>
            </div>

            <button
              onClick={logout}
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)'
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          /* VISTAS FORMULARIOS CONDICIONALES */
          view === 'login' ? (
            <LoginPage onToggleView={() => setView('register')} />
          ) : (
            <RegisterPage onToggleView={() => setView('login')} />
          )
        )}
      </section>

      <footer className="app-footer">
        <p>Proyecto Integrador 4</p>
      </footer>
    </main>
  );
}

export default App;
