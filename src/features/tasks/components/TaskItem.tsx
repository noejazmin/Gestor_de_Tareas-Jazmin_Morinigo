import React, { useState } from 'react';
import type { Task } from '../taskTypes';
import { TaskForm } from './TaskForm';

interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, title: string, description: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleComplete: (id: string, completed: boolean) => Promise<void>;
}

/**
 * ELEMENTO DE TAREA INDIVIDUAL (TaskItem):
 * 
 * Renderiza la información de cada tarea y gestiona las acciones de edición inline,
 * borrado y cambio de estado de completado.
 */
export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onUpdate,
  onDelete,
  onToggleComplete,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await onToggleComplete(task.id, !task.completed);
    } catch (err) {
      console.error('Error al alternar estado de completado:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (title: string, description: string) => {
    await onUpdate(task.id, title, description);
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
      <div className="task-item editing">
        <h4 className="editing-title">Editar Tarea</h4>
        <TaskForm
          onSubmit={handleUpdate}
          initialTitle={task.title}
          initialDescription={task.description}
          submitButtonText="Actualizar"
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''} ${loading ? 'task-loading' : ''}`}>
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
        <h3 className="task-item-title">{task.title}</h3>
        <p className="task-item-desc">{task.description}</p>
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
