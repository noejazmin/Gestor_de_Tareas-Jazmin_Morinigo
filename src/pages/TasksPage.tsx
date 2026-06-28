import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../features/tasks/useTasks';
import { TaskForm } from '../features/tasks/components/TaskForm';
import { TaskList } from '../features/tasks/components/TaskList';
import { TaskEmailButton } from '../features/tasks/components/TaskEmailButton';
import '../features/tasks/tasks.css';
import '../features/auth/auth.css';

/**
 * PÁGINA COMPOSITORA DE TAREAS (TasksPage):
 * 
 * Actúa como panel principal (Dashboard). Se encarga de:
 * 1. Obtener la sesión del usuario autenticado (AuthContext).
 * 2. Cargar las tareas y exponer las operaciones mediante el custom hook 'useTasks'.
 * 3. Distribuir y renderizar los componentes del formulario (TaskForm) y listado (TaskList).
 */
export const TasksPage: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompleted,
  } = useTasks(user?.uid);

  return (
    <div className="tasks-dashboard-layout">
      {/* Panel izquierdo: Información del usuario y Formulario de creación */}
      <aside className="tasks-panel-left">
        <div className="tasks-card-premium">
          <h3 className="tasks-header">
            <span className="icon tasks-header-icon">👤</span>
            Perfil de Usuario
          </h3>
          <div className="tasks-info-card">
            <strong className="tasks-info-label">Sesión iniciada como</strong>
            <span className="tasks-info-value">{user?.email}</span>
          </div>
          <button onClick={logout} className="btn-primary btn-logout">
            Cerrar Sesión
          </button>

          {/* Botón de envío de resumen de tareas por email */}
          <TaskEmailButton email={user?.email} tasks={tasks} />
        </div>

        <div className="tasks-card-premium">
          <h3 className="tasks-header">
            <span className="icon tasks-header-icon">➕</span>
            Nueva Tarea
          </h3>
          <TaskForm onSubmit={createTask} submitButtonText="Crear Tarea" />
        </div>
      </aside>

      {/* Panel derecho: Listado de tareas con onSnapshot en tiempo real */}
      <main className="tasks-panel-right">
        <div className="tasks-card-premium">
          <h3 className="tasks-header">
            <span className="icon tasks-header-icon">📋</span>
            Mis Tareas
          </h3>

          {error && <div className="task-error-alert">{error}</div>}

          {loading ? (
            <div className="tasks-loader-container">
              <div className="spinner route-loading-spinner" />
              <p className="tasks-loader-text">Cargando tareas en tiempo real...</p>
            </div>
          ) : (
            <TaskList
              tasks={tasks}
              onUpdate={updateTask}
              onDelete={deleteTask}
              onToggleComplete={toggleTaskCompleted}
            />
          )}
        </div>
      </main>
    </div>
  );
};
