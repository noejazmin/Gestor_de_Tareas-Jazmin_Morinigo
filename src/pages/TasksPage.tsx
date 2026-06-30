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
    filter,
    sortBy,
    setFilter,
    setSortBy,
    createTask,
    updateTask,
    reorderTasks,
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

          {/* Controles de Filtros y Ordenamiento (Hito 9) */}
          <div className="tasks-controls-header">
            <div className="tasks-filter-tabs">
              <button
                onClick={() => setFilter('all')}
                className={`filter-tab-btn ${filter === 'all' ? 'active' : ''}`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`filter-tab-btn ${filter === 'pending' ? 'active' : ''}`}
              >
                Pendientes
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`filter-tab-btn ${filter === 'completed' ? 'active' : ''}`}
              >
                Completadas
              </button>
            </div>

            <div className="tasks-sort-select-container">
              <label htmlFor="tasks-sort-by" className="sort-label">Ordenar por:</label>
              <select
                id="tasks-sort-by"
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'manual' | 'priority' | 'dueDate')}
              >
                <option value="manual">Orden manual</option>
                <option value="priority">Prioridad</option>
                <option value="dueDate">Fecha de vencimiento</option>
              </select>
            </div>
          </div>

          {error && <div className="task-error-alert">{error}</div>}

          {loading ? (
            <div className="tasks-loader-container">
              <div className="spinner route-loading-spinner" />
              <p className="tasks-loader-text">Cargando tareas en tiempo real...</p>
            </div>
          ) : (
            <TaskList
              tasks={tasks}
              sortBy={sortBy}
              onReorder={reorderTasks}
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
