import React from 'react';
import type { Task } from '../taskTypes';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onUpdate: (id: string, title: string, description: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleComplete: (id: string, completed: boolean) => Promise<void>;
}

/**
 * LISTADO DE TAREAS (TaskList):
 * 
 * Renderiza la lista de tareas. Muestra un estado vacío explicativo si no hay
 * tareas registradas para el usuario autenticado.
 */
export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onUpdate,
  onDelete,
  onToggleComplete,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="tasks-empty-state">
        <span className="empty-icon">📭</span>
        <p>No tenés ninguna tarea registrada. ¡Comenzá creando una!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onToggleComplete={onToggleComplete}
        />
      ))}
    </div>
  );
};
