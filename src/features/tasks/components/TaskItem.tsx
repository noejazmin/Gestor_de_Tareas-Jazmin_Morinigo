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
 * Muestra la información de la tarea con un maquetado modular de dos filas:
 * - Fila superior (Header): Tirador, Checkbox, Título y Badge de prioridad.
 * - Fila inferior (Body/Footer): Descripción, metadatos y botones de acción.
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
      {/* Fila Principal Superior (Header de la tarjeta) */}
      <div className="task-item-header">
        <div className="task-item-header-left">
          {/* 1. Tirador visual de arrastre (solo activo en ordenamiento manual) */}
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

          {/* 2. Checkbox personalizado */}
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

          {/* 3. Título de la tarea */}
          <h3 className="task-item-title">{task.title}</h3>
        </div>

        {/* 4. Prioridad a la derecha del encabezado */}
        <div className="task-item-header-right">
          <span className={`task-badge priority-${task.priority}`}>
            {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
          </span>
        </div>
      </div>

      {/* Cuerpo y pie de la tarjeta */}
      <div className="task-item-body">
        <p className="task-item-desc">{task.description}</p>
        
        <div className="task-item-footer">
          {/* Metadatos (Vencimiento y estado completado/vencido) */}
          <div className="task-item-footer-meta">
            <span className={`task-due-date-badge ${isOverdue ? 'overdue-text' : ''}`}>
              📅 {task.dueDate ? `Vence: ${task.dueDate}` : 'Sin vencimiento'}
            </span>
            {isOverdue && <span className="overdue-tag">⚠️ Vencida</span>}
            {task.completed && <span className="completed-tag">✓ Completada</span>}
          </div>

          {/* Botones de acción inline */}
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
      </div>
    </div>
  );
};
