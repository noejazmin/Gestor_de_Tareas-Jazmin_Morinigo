import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Task } from '../taskTypes';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  sortBy: 'manual' | 'priority' | 'dueDate';
  onReorder: (activeId: string, overId: string) => Promise<void>;
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
 * LISTADO DE TAREAS (TaskList):
 * 
 * Renderiza el listado. Modula el comportamiento de drag & drop (reordenamiento manual)
 * usando DndContext y SortableContext de @dnd-kit.
 */
export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  sortBy,
  onReorder,
  onUpdate,
  onDelete,
  onToggleComplete,
}) => {
  // Configuración didáctica de sensores para Pointer y Keyboard
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Tolerancia en píxeles para evitar activar arrastre en clicks comunes
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      onReorder(active.id as string, over.id as string);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="tasks-empty-state">
        <span className="empty-icon">📭</span>
        <p>No tenés ninguna tarea registrada. ¡Comenzá creando una!</p>
      </div>
    );
  }

  const isManualSort = sortBy === 'manual';

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="task-list">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isManualSort={isManualSort}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onToggleComplete={onToggleComplete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
