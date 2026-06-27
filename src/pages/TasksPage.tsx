import React from 'react';
import { useAuth } from '../hooks/useAuth';
import '../features/auth/auth.css';

/**
 * PÁGINA PROVISIONAL DE TAREAS (TasksPage):
 * 
 * Actúa como panel de control temporal para los usuarios autenticados.
 * 
 * - Muestra el correo electrónico del usuario conectado.
 * - Explica claramente que la funcionalidad CRUD se implementará en el próximo hito.
 * - Expone un botón para cerrar sesión de manera segura.
 */
export const TasksPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="status-card tasks-container-card">
      <h3 className="tasks-header">
        <span className="icon tasks-header-icon">✦</span>
        Panel de Tareas (Dashboard)
      </h3>
      
      <p className="tasks-description">
        ¡Hola! Has accedido a la sección privada del gestor de tareas. Actualmente las rutas privadas
        se encuentran protegidas de accesos no autorizados.
      </p>

      <div className="tasks-info-card">
        <strong className="tasks-info-label">
          Sesión Iniciada como
        </strong>
        <span className="tasks-info-value">
          {user?.email}
        </span>
      </div>

      <div className="tasks-didactic-note">
        ℹ️ <strong>Nota didáctica:</strong> El modelo de datos, las reglas de Firestore y las funciones CRUD de tareas
        (crear, editar, eliminar) serán desarrolladas e integradas en los próximos hitos del proyecto.
      </div>

      <button
        onClick={logout}
        className="btn-primary btn-logout"
      >
        Cerrar Sesión
      </button>
    </div>
  );
};
