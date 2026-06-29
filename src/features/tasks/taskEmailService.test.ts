import { describe, test, expect, vi, beforeEach } from 'vitest';
import { sendTaskSummaryEmail } from './taskEmailService';
import type { TaskEmailSummaryPayload } from './taskEmailService';

describe('taskEmailService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('Llama a /api/send-task-summary con método POST y el payload correcto', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, message: 'Enviado!' }),
    } as unknown as Response);

    const payload: TaskEmailSummaryPayload = {
      email: 'test@example.com',
      tasks: [{ id: '1', title: 'Tarea', description: 'Desc', completed: false }],
    };

    const result = await sendTaskSummaryEmail(payload);

    expect(fetchSpy).toHaveBeenCalledWith('/api/send-task-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    expect(result).toEqual({ success: true, message: 'Enviado!' });
  });

  test('Retorna success false cuando el servidor responde con un código de error HTTP', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ success: false, message: 'Error de servidor' }),
    } as unknown as Response);

    const payload: TaskEmailSummaryPayload = {
      email: 'test@example.com',
      tasks: [],
    };

    const result = await sendTaskSummaryEmail(payload);

    expect(result).toEqual({ success: false, message: 'Error de servidor' });
  });

  test('Maneja respuestas con error de JSON inválido', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    } as unknown as Response);

    const payload: TaskEmailSummaryPayload = {
      email: 'test@example.com',
      tasks: [],
    };

    const result = await sendTaskSummaryEmail(payload);

    expect(result.success).toBe(false);
    expect(result.message).toContain('Error del servidor: Código 400');
  });
});
