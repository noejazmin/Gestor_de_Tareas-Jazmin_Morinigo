import { db } from '../../services/firebase';
import { collection } from 'firebase/firestore';

/**
 * SERVICIO DE TAREAS (FIRESTORE):
 * 
 * Contiene las referencias básicas de Cloud Firestore para interactuar con la colección de tareas.
 * 
 * COMENTARIO DIDÁCTICO:
 * - 'tasksCollection': Apunta a la colección 'tasks' en Firestore.
 * - Toda la lógica de creación, lectura, actualización y borrado (CRUD) será desarrollada
 *   en los próximos hitos. Separar esta lógica de la interfaz de usuario asegura un diseño
 *   limpio y mantenible.
 */
export const tasksCollection = collection(db, 'tasks');
