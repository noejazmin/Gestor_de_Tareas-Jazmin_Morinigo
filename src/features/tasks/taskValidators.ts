import type { CreateTaskInput } from './taskTypes';

/**
 * VALIDACIÓN DE MODELO DE DATOS DE TAREA:
 * Helpers puros para comprobar que los datos recibidos antes de ser enviados a Firestore
 * cumplan con las reglas de negocio del modelo.
 * 
 * - 'userId': Obligatorio (no nulo, no vacío) para la seguridad de pertenencia de la tarea.
 * - 'title': No vacío y con caracteres significativos.
 * - 'description': No vacía y con caracteres significativos.
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
}
