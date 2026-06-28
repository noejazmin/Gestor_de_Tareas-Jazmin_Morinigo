import type { Task } from './taskTypes';

export interface TaskEmailSummaryPayload {
  email: string;
  tasks: Pick<Task, 'id' | 'title' | 'description' | 'completed'>[];
}

export interface SendTaskSummaryResponse {
  success: boolean;
  message: string;
}

/**
 * SERVICIO DE CORREO DE TAREAS (taskEmailService.ts):
 * 
 * Lógica del frontend para realizar la petición HTTP POST a la función serverless de Vercel.
 */
export async function sendTaskSummaryEmail(payload: TaskEmailSummaryPayload): Promise<SendTaskSummaryResponse> {
  const response = await fetch('/api/send-task-summary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    try {
      const errorData = await response.json() as SendTaskSummaryResponse;
      return {
        success: false,
        message: errorData.message || 'Error en el servidor al enviar el correo.',
      };
    } catch {
      return {
        success: false,
        message: `Error del servidor: Código ${response.status}`,
      };
    }
  }

  return response.json() as Promise<SendTaskSummaryResponse>;
}
