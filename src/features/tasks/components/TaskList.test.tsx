import React from 'react';
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
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: '2',
    title: 'Tarea 2',
    description: 'Descripción 2',
    completed: true,
    userId: 'user123',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
];

describe('TaskList Component', () => {
  test('Muestra estado vacío si no hay tareas', () => {
    render(
      <TaskList
        tasks={[]}
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
        onUpdate={async () => {}}
        onDelete={async () => {}}
        onToggleComplete={async () => {}}
      />
    );
    expect(screen.getByText('Tarea 1')).toBeInTheDocument();
    expect(screen.getByText('Descripción 1')).toBeInTheDocument();
    expect(screen.getByText('Tarea 2')).toBeInTheDocument();
    expect(screen.getByText('Descripción 2')).toBeInTheDocument();
  });
});
