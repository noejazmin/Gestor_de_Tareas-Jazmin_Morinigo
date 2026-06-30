import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { TaskForm } from './TaskForm';

describe('TaskForm Component', () => {
  test('Renderiza inputs de título, descripción, prioridad y fecha de vencimiento', () => {
    render(<TaskForm onSubmit={async () => {}} />);
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prioridad/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha de vencimiento/i)).toBeInTheDocument();
  });

  test('Muestra error si se intenta enviar con campos vacíos', async () => {
    render(<TaskForm onSubmit={async () => {}} />);
    
    const titleInput = screen.getByLabelText(/título/i);
    const descInput = screen.getByLabelText(/descripción/i);
    const submitBtn = screen.getByRole('button', { name: /guardar/i });

    // 1. Probar título vacío (con espacios para saltar la validación HTML5 required), con descripción válida
    fireEvent.change(titleInput, { target: { value: '   ' } });
    fireEvent.change(descInput, { target: { value: 'Una descripción de prueba válida' } });
    fireEvent.click(submitBtn);
    expect(await screen.findByText(/el título es obligatorio/i)).toBeInTheDocument();

    // 2. Probar descripción vacía (con espacios para saltar la validación HTML5 required), con título válido
    fireEvent.change(titleInput, { target: { value: 'Título de prueba válido' } });
    fireEvent.change(descInput, { target: { value: '   ' } });
    fireEvent.click(submitBtn);
    expect(await screen.findByText(/la descripción es obligatoria/i)).toBeInTheDocument();
  });

  test('Llama a onSubmit con título, descripción, prioridad y fecha de vencimiento', async () => {
    const mockSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={mockSubmit} />);

    const titleInput = screen.getByLabelText(/título/i);
    const descInput = screen.getByLabelText(/descripción/i);
    const prioritySelect = screen.getByLabelText(/prioridad/i);
    const dueDateInput = screen.getByLabelText(/fecha de vencimiento/i);
    const submitBtn = screen.getByRole('button', { name: /guardar/i });

    fireEvent.change(titleInput, { target: { value: 'Nueva Tarea' } });
    fireEvent.change(descInput, { target: { value: 'Detalle de la tarea' } });
    fireEvent.change(prioritySelect, { target: { value: 'high' } });
    fireEvent.change(dueDateInput, { target: { value: '2026-12-31' } });
    
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith('Nueva Tarea', 'Detalle de la tarea', 'high', '2026-12-31');
    });
  });

  test('Limpia campos después de crear una tarea', async () => {
    const mockSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={mockSubmit} />);

    const titleInput = screen.getByLabelText(/título/i) as HTMLInputElement;
    const descInput = screen.getByLabelText(/descripción/i) as HTMLTextAreaElement;
    const prioritySelect = screen.getByLabelText(/prioridad/i) as HTMLSelectElement;
    const dueDateInput = screen.getByLabelText(/fecha de vencimiento/i) as HTMLInputElement;
    const submitBtn = screen.getByRole('button', { name: /guardar/i });

    fireEvent.change(titleInput, { target: { value: 'Tarea limpia' } });
    fireEvent.change(descInput, { target: { value: 'Desc limpia' } });
    fireEvent.change(prioritySelect, { target: { value: 'low' } });
    fireEvent.change(dueDateInput, { target: { value: '2026-06-30' } });
    
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });

    expect(titleInput.value).toBe('');
    expect(descInput.value).toBe('');
    expect(prioritySelect.value).toBe('medium'); // Vuelve al valor por defecto
    expect(dueDateInput.value).toBe('');
  });
});
