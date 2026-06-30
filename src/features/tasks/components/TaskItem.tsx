import React, { useState, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../taskTypes';
import { TaskForm } from './TaskForm';

interface TaskItemProps {
  task: Task;
  isManualSort: boolean;
  onUpdate: (
    id: string,
    title: string,
    description: string,
    priority?: 'low' | 'medium' | 'high',
    dueDate?: string
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleComplete: (id: string, completed: boolean) => Promise<void>;
}

/**
 * ELEMENTO DE TAREA INDIVIDUAL (TaskItem):
 * 
 * Muestra el contenido de la tarea, badges de prioridad y fecha de vencimiento.
 * Integra useSortable de @dnd-kit para habilitar reordenamiento manual.
 */
export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  isManualSort,
  onUpdate,
  onDelete,
  onToggleComplete,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Lógica de dnd-kit para hacer la tarjeta arrastrable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !isManualSort });

  // Estilos de transformación provistos por dnd-kit
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Comprobar si la tarea está vencida y no completada
  const isOverdue = useMemo(() => {
    if (!task.dueDate || task.completed) return false;
    // Comparamos el string de fecha local (YYYY-MM-DD)
    const todayStr = new Date().toISOString().split('T')[0];
    return task.dueDate < todayStr;
  }, [task.dueDate, task.completed]);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await onToggleComplete(task.id, !task.completed);
    } catch (err) {
      console.error('Error al cambiar estado de completado:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (
    title: string,
    description: string,
    priority: 'low' | 'medium' | 'high',
    dueDate?: string
  ) => {
    await onUpdate(task.id, title, description, priority, dueDate);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      setLoading(true);
      try {
        await onDelete(task.id);
      } catch (err) {
        console.error('Error al eliminar la tarea:', err);
        setLoading(false);
      }
    }
  };

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="task-item editing"
      >
        <h4 className="editing-title">Editar Tarea</h4>
        <TaskForm
          onSubmit={handleUpdate}
          initialTitle={task.title}
          initialDescription={task.description}
          initialPriority={task.priority}
          initialDueDate={task.dueDate}
          submitButtonText="Actualizar"
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-item ${task.completed ? 'completed' : ''} ${loading ? 'task-loading' : ''} ${isDragging ? 'task-item-dragging' : ''} ${isOverdue ? 'overdue-alert-border' : ''}`}
    >
      {/* Control visual de arrastre (solo activo en ordenamiento manual) */}
      {isManualSort && (
        <div
          className="task-drag-handle"
          {...attributes}
          {...listeners}
          title="Arrastrar para reordenar"
          aria-label="Arrastrar para reordenar"
        >
          ⠿
        </div>
      )}

      <div className="task-item-checkbox-container">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggle}
            disabled={loading}
            aria-label="Marcar tarea como completada"
          />
          <span className="checkbox-custom" />
        </label>
      </div>

      <div className="task-item-content">
        <div className="task-item-header-meta">
          <h3 className="task-item-title">{task.title}</h3>
          
          {/* Badge de prioridad */}
          <span className={`task-badge priority-${task.priority}`}>
            {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
          </span>
        </div>

        <p className="task-item-desc">{task.description}</p>
        
        {/* Fecha de vencimiento con indicador de atraso */}
        <div className={`task-due-date ${isOverdue ? 'overdue-text' : ''}`}>
          <span>📅 {task.dueDate ? `Vence: ${task.dueDate}` : 'Sin vencimiento'}</span>
          {isOverdue && <span className="overdue-tag">⚠️ Vencida</span>}
        </div>
      </div>

      <div className="task-item-actions">
        <button
          onClick={() => setIsEditing(true)}
          className="btn-item btn-edit"
          disabled={loading}
          title="Editar Tarea"
          aria-label="Editar Tarea"
        >
          ✏️
        </button>
        <button
          onClick={handleDelete}
          className="btn-item btn-delete"
          disabled={loading}
          title="Eliminar Tarea"
          aria-label="Eliminar Tarea"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};
