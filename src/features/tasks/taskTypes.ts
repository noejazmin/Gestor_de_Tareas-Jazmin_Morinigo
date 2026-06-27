import { Timestamp } from 'firebase/firestore';

/**
 * REPRESENTACIÓN DE UNA TAREA EN EL SISTEMA:
 * - 'id': Identificador único del documento de la tarea generado por Firestore.
 * - 'title': Título descriptivo de la tarea.
 * - 'description': Detalle de lo que se debe realizar en la tarea.
 * - 'completed': Estado de finalización de la tarea (true/false).
 * - 'userId': ID del usuario (uid) al que le pertenece esta tarea. Sirve para filtrar y proteger datos.
 * - 'createdAt': Marca de tiempo de cuándo se creó la tarea en Firestore.
 * - 'updatedAt': Marca de tiempo de la última modificación en Firestore.
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * DATOS REQUERIDOS PARA CREAR UNA TAREA:
 * Al crear la tarea, el estado 'completed' suele ser 'false' por defecto, y
 * las fechas de creación/actualización las maneja el servidor de Firestore o el servicio.
 * El campo 'userId' es obligatorio para asociar la tarea a su creador de inmediato.
 */
export interface CreateTaskInput {
  title: string;
  description: string;
  userId: string;
}

/**
 * CAMPOS PERMITIDOS PARA ACTUALIZAR UNA TAREA:
 * Al actualizar una tarea, todos los campos modificables son opcionales
 * para permitir actualizaciones parciales de los datos.
 */
export interface UpdateTaskInput {
  title?: string;
  description?: string;
  completed?: boolean;
}
