import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../features/auth/auth.css';

/**
 * COMPONENTE PublicRoute (Ruta Pública Protegida):
 * 
 * ¿QUÉ ES UNA RUTA PÚBLICA PROTEGIDA?
 * Evita que usuarios que ya tienen una sesión activa ingresen a formularios de Login o Registro
 * de forma innecesaria. Si un usuario ya está autenticado, no tiene sentido mostrarle la pantalla de inicio de sesión.
 * 
 * ¿POR QUÉ NECESITAMOS ESPERAR A 'loading'?
 * Al igual que en la ruta protegida, si no esperáramos a que Firebase verifique el token local,
 * la aplicación asumiría erróneamente que no hay usuario e intentaría renderizar el Login por unos instantes,
 * generando un parpadeo visual molesto antes de redirigir a /tasks.
 */
export const PublicRoute: React.FC = () => {
  const { user, loading } = useAuth();

  // Si Firebase aún está verificando el estado de la sesión, mostramos la pantalla de carga
  if (loading) {
    return (
      <main className="app-container">
        <header className="app-header">
          <span className="badge">Validando Permisos</span>
          <h1>Cargando...</h1>
        </header>
        <section className="status-section">
          <div className="status-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px' }}>
            <h3>Verificando credenciales...</h3>
            <div className="spinner" style={{ borderTopColor: 'var(--accent)', borderWidth: '4px', width: '32px', height: '32px', marginTop: '20px' }} />
          </div>
        </section>
      </main>
    );
  }

  // Si hay un usuario logueado en el sistema, lo redirigimos automáticamente a la ruta privada (/tasks)
  if (user) {
    return <Navigate to="/tasks" replace />;
  }

  // Si no está logueado, se le permite ingresar y ver la ruta pública (ej. Login o Registro)
  return <Outlet />;
};
