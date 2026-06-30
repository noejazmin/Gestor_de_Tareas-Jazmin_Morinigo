import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { TaskItem } from './TaskItem';
import type { Task } from '../taskTypes';
import { Timestamp } from 'firebase/firestore';

const mockTask: Task = {
  id: '1',
  title: 'Test Tarea',
  description: 'Test Desc',
  completed: false,
  userId: 'user123',
  priority: 'high',
  dueDate: '2026-12-31',
  order: 0,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};

describe('TaskItem Component', () => {
  test('Muestra título, descripción, prioridad y vencimiento', () => {
    render(
      <TaskItem
        task={mockTask}
        isManualSort={false}
        onUpdate={async () => {}}
        onDelete={async () => {}}
        onToggleComplete={async () => {}}
      />
    );
    expect(screen.getByText('Test Tarea')).toBeInTheDocument();
    expect(screen.getByText('Test Desc')).toBeInTheDocument();
    expect(screen.getByText('Alta')).toBeInTheDocument();
    expect(screen.getByText(/vence: 2026-12-31/i)).toBeInTheDocument();
  });

  test('Muestra el indicador de arrastre si el ordenamiento manual está activo', () => {
    const { rerender } = render(
      <TaskItem
        task={mockTask}
        isManualSort={true}
        onUpdate={async () => {}}
        onDelete={async () => {}}
        onToggleComplete={async () => {}}
      />
    );
    expect(screen.getByLabelText(/arrastrar para reordenar/i)).toBeInTheDocument();

    rerender(
      <TaskItem
        task={mockTask}
        isManualSort={false}
        onUpdate={async () => {}}
        onDelete={async () => {}}
        onToggleComplete={async () => {}}
      />
    );
    expect(screen.queryByLabelText(/arrastrar para reordenar/i)).not.toBeInTheDocument();
  });

  test('Permite marcar tarea como completada llamando a onToggleComplete', async () => {
    const mockToggle = vi.fn().mockResolvedValue(undefined);
    render(
      <TaskItem
        task={mockTask}
        isManualSort={false}
        onUpdate={async () => {}}
        onDelete={async () => {}}
        onToggleComplete={mockToggle}
      />
    );

    const checkbox = screen.getByLabelText(/marcar tarea como completada/i);
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(mockToggle).toHaveBeenCalledWith('1', true);
    });
  });

  test('Permite entrar en modo edición y llamar a onUpdate', async () => {
    const mockUpdate = vi.fn().mockResolvedValue(undefined);
    render(
      <TaskItem
        task={mockTask}
        isManualSort={false}
        onUpdate={mockUpdate}
        onDelete={async () => {}}
        onToggleComplete={async () => {}}
      />
    );

    const editBtn = screen.getByRole('button', { name: /editar tarea/i });
    fireEvent.click(editBtn);

    expect(screen.getByRole('heading', { name: /editar tarea/i })).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/título/i);
    const descInput = screen.getByLabelText(/descripción/i);
    const prioritySelect = screen.getByLabelText(/prioridad/i);
    const dueDateInput = screen.getByLabelText(/fecha de vencimiento/i);
    const saveBtn = screen.getByRole('button', { name: /actualizar/i });

    fireEvent.change(titleInput, { target: { value: 'Tarea Editada' } });
    fireEvent.change(descInput, { target: { value: 'Desc Editada' } });
    fireEvent.change(prioritySelect, { target: { value: 'low' } });
    fireEvent.change(dueDateInput, { target: { value: '2026-06-30' } });
    
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith('1', 'Tarea Editada', 'Desc Editada', 'low', '2026-06-30');
    });
  });

  test('Permite eliminar llamando a onDelete, mockeando window.confirm', async () => {
    const mockDelete = vi.fn().mockResolvedValue(undefined);
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);

    render(
      <TaskItem
        task={mockTask}
        isManualSort={false}
        onUpdate={async () => {}}
        onDelete={mockDelete}
        onToggleComplete={async () => {}}
      />
    );

    const deleteBtn = screen.getByRole('button', { name: /eliminar tarea/i });
    fireEvent.click(deleteBtn);

    expect(confirmSpy).toHaveBeenCalledWith('¿Estás seguro de que deseas eliminar esta tarea?');
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('1');
    });

    confirmSpy.mockRestore();
  });
});
