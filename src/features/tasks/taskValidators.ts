import type { CreateTaskInput } from './taskTypes';

/**
 * VALIDACIÓN DE MODELO DE DATOS DE TAREA:
 * Helpers puros para comprobar que los datos recibidos antes de ser enviados a Firestore
 * cumplan con las reglas de negocio del modelo.
 */
export function validateCreateTask(input: CreateTaskInput): void {
  if (!input.userId || input.userId.trim() === '') {
    throw new Error('El ID de usuario (userId) es obligatorio.');
  }

  if (!input.title || input.title.trim() === '') {
    throw new Error('El título de la tarea no puede estar vacío.');
  }

  if (!input.description || input.description.trim() === '') {
    throw new Error('La descripción de la tarea no puede estar vacía.');
  }

  // Validación didáctica de prioridad
  if (!input.priority || !['low', 'medium', 'high'].includes(input.priority)) {
    throw new Error('La prioridad de la tarea debe ser "low", "medium" o "high".');
  }

  // Validación didáctica de fecha de vencimiento (si está definida)
  if (input.dueDate && typeof input.dueDate === 'string' && input.dueDate.trim() !== '') {
    const parsedDate = Date.parse(input.dueDate);
    if (isNaN(parsedDate)) {
      throw new Error('La fecha de vencimiento provista es inválida.');
    }
  }
}
