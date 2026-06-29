import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { TaskEmailButton } from './TaskEmailButton';
import { sendTaskSummaryEmail } from '../taskEmailService';
import type { Task } from '../taskTypes';
import { Timestamp } from 'firebase/firestore';

// Mockear el servicio de email
vi.mock('../taskEmailService', () => ({
  sendTaskSummaryEmail: vi.fn(),
}));

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Tarea 1',
    description: 'Desc 1',
    completed: false,
    userId: 'user123',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
];

describe('TaskEmailButton Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('Muestra error si no hay email', async () => {
    render(<TaskEmailButton email={null} tasks={mockTasks} />);
    const button = screen.getByRole('button', { name: /enviar resumen por email/i });
    
    fireEvent.click(button);

    expect(await screen.findByText(/no se detectó un correo electrónico de usuario válido/i)).toBeInTheDocument();
  });

  test('Llama al servicio de email al hacer click y muestra mensaje de éxito cuando responde success', async () => {
    const mockSend = vi.mocked(sendTaskSummaryEmail).mockResolvedValue({
      success: true,
      message: 'Email enviado correctamente!',
    });

    render(<TaskEmailButton email="user@test.com" tasks={mockTasks} />);
    const button = screen.getByRole('button', { name: /enviar resumen por email/i });
    
    fireEvent.click(button);

    expect(screen.getByText(/enviando.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockSend).toHaveBeenCalledWith({
        email: 'user@test.com',
        tasks: [{ id: '1', title: 'Tarea 1', description: 'Desc 1', completed: false }],
      });
    });

    expect(await screen.findByText('Email enviado correctamente!')).toBeInTheDocument();
  });

  test('Muestra mensaje de error cuando el servicio responde success false', async () => {
    const mockSend = vi.mocked(sendTaskSummaryEmail).mockResolvedValue({
      success: false,
      message: 'Fallo al despachar correo',
    });

    render(<TaskEmailButton email="user@test.com" tasks={mockTasks} />);
    const button = screen.getByRole('button', { name: /enviar resumen por email/i });
    
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSend).toHaveBeenCalled();
    });

    expect(await screen.findByText('Fallo al despachar correo')).toBeInTheDocument();
  });
});
