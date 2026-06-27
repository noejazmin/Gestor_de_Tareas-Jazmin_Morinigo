import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../features/auth/auth.css';

/**
 * COMPONENTE ProtectedRoute (Ruta Protegida):
 * 
 * ¿QUÉ ES UNA RUTA PROTEGIDA?
 * Es un filtro de seguridad en la UI que envuelve a las rutas privadas. Impide que usuarios
 * no registrados o que no hayan iniciado sesión puedan ver información restringida (como el panel de tareas).
 * 
 * ¿POR QUÉ NECESITAMOS ESPERAR A 'loading'?
 * Firebase Auth inicializa y valida la sesión local de forma asíncrona tras unos milisegundos.
 * Si no esperáramos a que 'loading' sea falso, el sistema asumiría que el usuario es null temporalmente
 * y lo redirigiría inmediatamente a /login. Esperar a 'loading' evita estas redirecciones prematuras.
 * 
 * ¿QUÉ HACE Navigate?
 * Redirige de forma declarativa al usuario a una nueva ruta. Usamos 'replace' para reemplazar el historial
 * del navegador, impidiendo que el botón de "atrás" del navegador los regrese a la zona privada sin sesión.
 * 
 * ¿QUÉ HACE Outlet?
 * Es un marcador de posición (placeholder) de react-router-dom que renderiza la ruta hija correspondiente
 * (en este caso, TasksPage) cuando el usuario cumple con la condición de estar autenticado.
 */
export const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  // Si Firebase aún está verificando si existe sesión activa, mostramos una carga
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

  // Si no hay un usuario autenticado, redirigimos a la pantalla de login de forma segura
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario está autenticado, permitimos renderizar la ruta privada solicitada (hijos)
  return <Outlet />;
};
