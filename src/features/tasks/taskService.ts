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
} from 'firebase/firestore';
import type { Task, CreateTaskInput, UpdateTaskInput } from './taskTypes';
import { validateCreateTask } from './taskValidators';

/**
 * SERVICIO DE TAREAS (FIRESTORE):
 * 
 * Encapsula toda la interacción directa con el SDK de Firestore para aislar
 * la lógica de negocio y base de datos de los componentes React.
 */
export const tasksCollection = collection(db, 'tasks');

/**
 * Crea una tarea nueva en Firestore y devuelve su ID asignado.
 * Valida los datos localmente antes del envío.
 */
export async function createTask(input: CreateTaskInput): Promise<string> {
  // Validación de modelo previa
  validateCreateTask(input);

  const docRef = await addDoc(tasksCollection, {
    title: input.title,
    description: input.description,
    completed: false,
    userId: input.userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Actualiza el título y la descripción de una tarea existente.
 */
export async function updateTask(taskId: string, input: UpdateTaskInput): Promise<void> {
  const docRef = doc(db, 'tasks', taskId);
  await updateDoc(docRef, {
    title: input.title,
    description: input.description,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Cambia el estado de completado de una tarea (completada o pendiente).
 */
export async function toggleTaskCompleted(taskId: string, completed: boolean): Promise<void> {
  const docRef = doc(db, 'tasks', taskId);
  await updateDoc(docRef, {
    completed,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Elimina físicamente una tarea de Firestore por su ID de documento.
 */
export async function deleteTask(taskId: string): Promise<void> {
  const docRef = doc(db, 'tasks', taskId);
  await deleteDoc(docRef);
}

/**
 * Suscribe un observador en tiempo real para escuchar cambios en las tareas del usuario.
 * 
 * COMENTARIO DIDÁCTICO:
 * - 'onSnapshot': Escucha activa del servidor de Firestore. Cada creación, edición
 *   o eliminación actualizará la UI reactivamente sin recargas manuales.
 * - 'Timestamp.now()': Se provee como fallback temporal para prevenir errores de tipo
 *   en el cliente durante la estimación local previa al guardado en el servidor de Firebase.
 * 
 * @param userId ID del usuario autenticado para filtrar las tareas correspondientes.
 * @param onTasksChange Callback disparado cada vez que cambian las tareas en Firestore.
 * @param onError Callback en caso de error de conexión o de permisos de Firestore.
 * @returns Función de limpieza (unsubscribe) para cerrar la suscripción al desmontar.
 */
export function subscribeToUserTasks(
  userId: string,
  onTasksChange: (tasks: Task[]) => void,
  onError: (error: Error) => void
): () => void {
  const q = query(
    tasksCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks: Task[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        tasks.push({
          id: docSnap.id,
          title: data.title || '',
          description: data.description || '',
          completed: !!data.completed,
          userId: data.userId || '',
          createdAt: (data.createdAt as Timestamp) || Timestamp.now(),
          updatedAt: (data.updatedAt as Timestamp) || Timestamp.now(),
        });
      });
      onTasksChange(tasks);
    },
    (error) => {
      onError(error);
    }
  );
}
