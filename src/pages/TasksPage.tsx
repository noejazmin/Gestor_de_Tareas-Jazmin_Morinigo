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
        ¡Hola! Has accedido a la sección privada. El modelo de datos de tareas y las reglas de seguridad
        de Cloud Firestore ya se encuentran configurados y listos para la integración del CRUD.
      </p>

      <div className="tasks-info-card">
        <strong className="tasks-info-label">
          Usuario Autenticado
        </strong>
        <span className="tasks-info-value">
          {user?.email} (UID: {user?.uid})
        </span>
      </div>

      <div className="tasks-didactic-note">
        <strong>Estructura del Modelo (Hito 5):</strong>
        <ul className="tasks-model-list">
          <li><strong>id:</strong> Identificador del documento.</li>
          <li><strong>title:</strong> Título de la tarea.</li>
          <li><strong>description:</strong> Detalle de la tarea.</li>
          <li><strong>completed:</strong> Estado (booleano).</li>
          <li><strong>userId:</strong> ID del creador (para aislar datos).</li>
          <li><strong>createdAt / updatedAt:</strong> Fechas (Timestamp).</li>
        </ul>
      </div>

      <div className="tasks-didactic-note tasks-security-success">
        🛡️ <strong>Reglas de Seguridad configuradas:</strong> Cada usuario está restringido para crear, leer, editar
        o eliminar únicamente sus propios documentos de tareas a través de la validación de <code>request.auth.uid</code>.
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
