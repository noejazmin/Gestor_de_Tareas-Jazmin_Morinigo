import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { TaskList } from './TaskList';
import type { Task } from '../taskTypes';
import { Timestamp } from 'firebase/firestore';

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Tarea 1',
    description: 'Descripción 1',
    completed: false,
    userId: 'user123',
    priority: 'high',
    dueDate: '2026-12-31',
    order: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: '2',
    title: 'Tarea 2',
    description: 'Descripción 2',
    completed: true,
    userId: 'user123',
    priority: 'low',
    order: 1,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
];

describe('TaskList Component', () => {
  test('Muestra estado vacío si no hay tareas', () => {
    render(
      <TaskList
        tasks={[]}
        sortBy="manual"
        onReorder={async () => {}}
        onUpdate={async () => {}}
        onDelete={async () => {}}
        onToggleComplete={async () => {}}
      />
    );
    expect(screen.getByText(/no tenés ninguna tarea registrada/i)).toBeInTheDocument();
  });

  test('Renderiza tareas recibidas por props', () => {
    render(
      <TaskList
        tasks={mockTasks}
        sortBy="manual"
        onReorder={async () => {}}
        onUpdate={async () => {}}
        onDelete={async () => {}}
        onToggleComplete={async () => {}}
      />
    );
    expect(screen.getByText('Tarea 1')).toBeInTheDocument();
    expect(screen.getByText('Descripción 1')).toBeInTheDocument();
    expect(screen.getByText('Tarea 2')).toBeInTheDocument();
    expect(screen.getByText('Descripción 2')).toBeInTheDocument();
    expect(screen.getByText(/vence: 2026-12-31/i)).toBeInTheDocument();
  });

  test('Soporta tareas antiguas sin dueDate ni prioridad sin romperse', () => {
    const legacyTask = {
      id: 'legacy-1',
      title: 'Tarea Antigua',
      description: 'Sin prioridad ni fecha',
      completed: false,
      userId: 'user123',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    } as unknown as Task; // Forzar casteo para emular datos antiguos de la DB

    render(
      <TaskList
        tasks={[legacyTask]}
        sortBy="manual"
        onReorder={async () => {}}
        onUpdate={async () => {}}
        onDelete={async () => {}}
        onToggleComplete={async () => {}}
      />
    );

    expect(screen.getByText('Tarea Antigua')).toBeInTheDocument();
    expect(screen.getByText('Sin prioridad ni fecha')).toBeInTheDocument();
    expect(screen.getByText(/sin vencimiento/i)).toBeInTheDocument();
  });
});
