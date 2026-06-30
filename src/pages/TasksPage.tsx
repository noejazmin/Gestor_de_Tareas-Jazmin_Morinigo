import React, { useMemo, useState } from 'react';
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
 * 3. Calcular reactivamente métricas del dashboard (KPIs) en memoria.
 * 4. Gestionar el estado persistente de tema claro/oscuro (localStorage).
 * 5. Distribuir y renderizar los componentes del formulario (TaskForm) y listado (TaskList).
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

  // Inicialización de tema (LocalStorage -> Prefers Color Scheme -> Default Dark)
  // COMENTARIO DIDÁCTICO:
  // - Usamos una función de retorno en useState para evaluar el tema solo en el montaje inicial.
  // - prefers-color-scheme provee una mejor experiencia si el usuario no ha tomado una decisión explícita.
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('tasks-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('tasks-theme', nextTheme);
  };

  // Calcular métricas para el dashboard de forma reactiva (useMemo)
  const metrics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    let total = tasks.length;
    let pending = 0;
    let completed = 0;
    let overdue = 0;

    tasks.forEach((t) => {
      if (t.completed) {
        completed++;
      } else {
        pending++;
        if (t.dueDate && t.dueDate < today) {
          overdue++;
        }
      }
    });

    return { total, pending, completed, overdue };
  }, [tasks]);

  return (
    <div className={`tasks-page-wrapper theme-${theme}`}>
      {/* Header Superior del Dashboard */}
      <header className="dashboard-top-header">
        <div className="header-titles">
          <h1 className="dashboard-title">Panel de Tareas</h1>
          <p className="dashboard-subtitle">Organizá, priorizá y seguí tus pendientes</p>
        </div>
        <div className="header-user-meta">
          {/* Botón de cambio de tema minimalista y estético */}
          <button
            onClick={toggleTheme}
            className="btn-theme-toggle"
            aria-label={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}
            title={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <span className="user-email-tag" title={user?.email || ''}>
            👤 {user?.email}
          </span>
          <button onClick={logout} className="btn-logout-small" title="Cerrar Sesión">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="tasks-dashboard-layout">
        {/* Columna izquierda compacta: perfil, email, nueva tarea */}
        <aside className="tasks-panel-left">
          <div className="tasks-card-premium compact-profile-card">
            <h3 className="tasks-header">
              <span className="icon tasks-header-icon">✉️</span>
              Resumen por Email
            </h3>
            <p className="sidebar-info-text">
              Recibí un reporte estructurado de tus tareas directamente en tu correo electrónico.
            </p>
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

        {/* Columna derecha principal: Resumen, Filtros, Orden, Lista */}
        <main className="tasks-panel-right">
          {/* Tarjetas de Resumen KPI */}
          <div className="dashboard-kpi-grid">
            <div className="kpi-card total">
              <span className="kpi-icon">📊</span>
              <div className="kpi-info">
                <span className="kpi-label">Total</span>
                <span className="kpi-value">{metrics.total}</span>
              </div>
            </div>
            <div className="kpi-card pending">
              <span className="kpi-icon">⏳</span>
              <div className="kpi-info">
                <span className="kpi-label">Pendientes</span>
                <span className="kpi-value">{metrics.pending}</span>
              </div>
            </div>
            <div className="kpi-card completed">
              <span className="kpi-icon">✅</span>
              <div className="kpi-info">
                <span className="kpi-label">Completadas</span>
                <span className="kpi-value">{metrics.completed}</span>
              </div>
            </div>
            <div className="kpi-card overdue">
              <span className="kpi-icon">⚠️</span>
              <div className="kpi-info">
                <span className="kpi-label">Vencidas</span>
                <span className="kpi-value">{metrics.overdue}</span>
              </div>
            </div>
          </div>

          {/* Listado de tareas card */}
          <div className="tasks-card-premium main-list-card">
            {/* Toolbar unificado de filtros y ordenamiento */}
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
                <label htmlFor="tasks-sort-by" className="sort-label">Ordenar:</label>
                <select
                  id="tasks-sort-by"
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'manual' | 'priority' | 'dueDate')}
                >
                  <option value="manual">Orden manual</option>
                  <option value="priority">Prioridad</option>
                  <option value="dueDate">Vencimiento</option>
                </select>
              </div>
            </div>

            {error && <div className="task-error-alert">{error}</div>}

            {loading ? (
              <div className="tasks-loader-container">
                <div className="spinner route-loading-spinner" />
                <p className="tasks-loader-text">Cargando tus tareas...</p>
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
    </div>
  );
};
