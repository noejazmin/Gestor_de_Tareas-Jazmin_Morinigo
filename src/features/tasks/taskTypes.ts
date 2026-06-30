import { Timestamp } from 'firebase/firestore';

/**
 * REPRESENTACIÓN DE UNA TAREA EN EL SISTEMA:
 * - 'id': Identificador único del documento de la tarea generado por Firestore.
 * - 'title': Título descriptivo de la tarea.
 * - 'description': Detalle de lo que se debe realizar en la tarea.
 * - 'completed': Estado de finalización de la tarea (true/false).
 * - 'userId': ID del usuario (uid) al que le pertenece esta tarea.
 * - 'priority': Nivel de prioridad ("low" | "medium" | "high").
 * - 'dueDate': Fecha límite de vencimiento opcional en formato cadena (YYYY-MM-DD).
 * - 'order': Entero para indicar el ordenamiento manual drag & drop de las tareas.
 * - 'createdAt': Marca de tiempo de cuándo se creó la tarea en Firestore.
 * - 'updatedAt': Marca de tiempo de la última modificación en Firestore.
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  userId: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * DATOS REQUERIDOS PARA CREAR UNA TAREA:
 */
export interface CreateTaskInput {
  title: string;
  description: string;
  userId: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  order: number;
}

/**
 * CAMPOS PERMITIDOS PARA ACTUALIZAR UNA TAREA:
 */
export interface UpdateTaskInput {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  order?: number;
}
