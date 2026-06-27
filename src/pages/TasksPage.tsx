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
    <div className="status-card" style={{ maxWidth: '480px', margin: '0 auto' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span className="icon" style={{
          background: 'rgba(170, 59, 255, 0.15)',
          color: 'var(--accent)',
          border: '1px solid var(--accent-border)',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px'
        }}>✦</span>
        Panel de Tareas (Dashboard)
      </h3>
      
      <p style={{ margin: '0 0 20px 0', fontSize: '14px', lineHeight: '1.5' }}>
        ¡Hola! Has accedido a la sección privada del gestor de tareas. Actualmente las rutas privadas
        se encuentran protegidas de accesos no autorizados.
      </p>

      <div style={{
        background: 'var(--code-bg)',
        padding: '16px',
        borderRadius: '10px',
        marginBottom: '20px',
        border: '1px solid var(--border)',
        textAlign: 'left'
      }}>
        <strong style={{ color: 'var(--text-h)', display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
          Sesión Iniciada como
        </strong>
        <span style={{ fontSize: '15px', color: 'var(--accent)', fontWeight: '600' }}>
          {user?.email}
        </span>
      </div>

      <div style={{
        padding: '12px 16px',
        borderRadius: '10px',
        background: 'var(--accent-bg)',
        border: '1px solid var(--accent-border)',
        color: 'var(--text-h)',
        fontSize: '13px',
        textAlign: 'left',
        lineHeight: '1.4',
        marginBottom: '24px'
      }}>
        ℹ️ <strong>Nota didáctica:</strong> El modelo de datos, las reglas de Firestore y las funciones CRUD de tareas
        (crear, editar, eliminar) serán desarrolladas e integradas en los próximos hitos del proyecto.
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
  );
};
