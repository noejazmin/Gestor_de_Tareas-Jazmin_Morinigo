import { db } from '../../services/firebase';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import type { Task, CreateTaskInput, UpdateTaskInput } from './taskTypes';
import { validateCreateTask } from './taskValidators';

/**
 * SERVICIO DE TAREAS (FIRESTORE):
 * 
 * Encapsula la comunicación con Cloud Firestore para la gestión de las tareas.
 */
export const tasksCollection = collection(db, 'tasks');

/**
 * Crea una tarea nueva en Firestore y devuelve su ID.
 */
export async function createTask(input: CreateTaskInput): Promise<string> {
  // Validación de negocio del modelo
  validateCreateTask(input);

  const docRef = await addDoc(tasksCollection, {
    title: input.title,
    description: input.description,
    completed: false,
    userId: input.userId,
    priority: input.priority,
    dueDate: input.dueDate || null,
    order: input.order,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Actualiza los campos de una tarea existente.
 */
export async function updateTask(taskId: string, input: UpdateTaskInput): Promise<void> {
  const docRef = doc(db, 'tasks', taskId);
  const updateData: Record<string, any> = {
    updatedAt: serverTimestamp(),
  };

  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.completed !== undefined) updateData.completed = input.completed;
  if (input.priority !== undefined) updateData.priority = input.priority;
  if (input.dueDate !== undefined) updateData.dueDate = input.dueDate || null;
  if (input.order !== undefined) updateData.order = input.order;

  await updateDoc(docRef, updateData);
}

/**
 * Actualiza el orden (posiciones) de múltiples tareas atómicamente en un solo Batch.
 * 
 * COMENTARIO DIDÁCTICO:
 * - 'writeBatch': Agrupa múltiples escrituras en una sola petición de red, garantizando
 *   que todas las actualizaciones de posición se guarden con éxito (o ninguna si falla).
 */
export async function updateTasksOrder(tasksToUpdate: { id: string; order: number }[]): Promise<void> {
  const batch = writeBatch(db);
  tasksToUpdate.forEach((t) => {
    const docRef = doc(db, 'tasks', t.id);
    batch.update(docRef, {
      order: t.order,
      updatedAt: serverTimestamp(),
    });
  });
  await batch.commit();
}

/**
 * Cambia el estado de completado de una tarea.
 */
export async function toggleTaskCompleted(taskId: string, completed: boolean): Promise<void> {
  const docRef = doc(db, 'tasks', taskId);
  await updateDoc(docRef, {
    completed,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Elimina una tarea por su ID.
 */
export async function deleteTask(taskId: string): Promise<void> {
  const docRef = doc(db, 'tasks', taskId);
  await deleteDoc(docRef);
}

/**
 * Suscribe un observador en tiempo real para escuchar las tareas del usuario.
 * 
 * COMENTARIO DIDÁCTICO:
 * - Mapeamos 'priority', 'dueDate' y 'order' con fallbacks seguros. Las tareas antiguas
 *   sin estos campos se adaptan para no romper la interfaz web.
 */
export function subscribeToUserTasks(
  userId: string,
  onTasksChange: (tasks: Task[]) => void,
  onError: (error: Error) => void
): () => void {
  // Mantenemos la consulta base ordenada por createdAt desc para el orden cronológico inicial
  const q = query(
    tasksCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks: Task[] = [];
      let index = 0;
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        tasks.push({
          id: docSnap.id,
          title: data.title || '',
          description: data.description || '',
          completed: !!data.completed,
          userId: data.userId || '',
          priority: data.priority || 'medium',
          dueDate: data.dueDate || undefined,
          // Si no tiene order asignado, se le otorga index (0, 1, 2...) para preservar
          // el orden cronológico inicial (el más nuevo arriba) cuando se ordena de forma ascendente.
          order: typeof data.order === 'number' ? data.order : index,
          createdAt: (data.createdAt as Timestamp) || Timestamp.now(),
          updatedAt: (data.updatedAt as Timestamp) || Timestamp.now(),
        });
        index++;
      });
      onTasksChange(tasks);
    },
    (error) => {
      onError(error);
    }
  );
}
