import { useState, useEffect, useCallback } from 'react';
import type { Task, CreateTaskInput, UpdateTaskInput } from './taskTypes';
import {
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
  toggleTaskCompleted as apiToggleTaskCompleted,
  subscribeToUserTasks,
} from './taskService';

/**
 * HOOK DE REACT PARA LA GESTIÓN DE TAREAS (useTasks):
 * 
 * Centraliza el estado de las tareas del usuario autenticado, gestiona la
 * suscripción en tiempo real y expone las operaciones CRUD.
 * 
 * COMENTARIO DIDÁCTICO:
 * - 'unsubscribe': Retornamos esta función al desmontar el componente o al cambiar
 *   de usuario. Esto cancela la escucha de Firestore y evita memory leaks y sobrecostos.
 */
export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Suscribirse a las tareas en tiempo real al montar o cambiar de usuario
  useEffect(() => {
    if (!userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToUserTasks(
      userId,
      (updatedTasks) => {
        setTasks(updatedTasks);
        setLoading(false);
      },
      (err) => {
        console.error('Error en suscripción de tareas:', err);
        setError('No pudimos cargar tus tareas. Intentá nuevamente.');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userId]);

  // Crear una nueva tarea
  const createTask = useCallback(
    async (title: string, description: string) => {
      if (!userId) {
        throw new Error('Usuario no autenticado.');
      }
      setError(null);
      try {
        const input: CreateTaskInput = { title, description, userId };
        await apiCreateTask(input);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al crear la tarea.';
        setError(msg);
        throw err;
      }
    },
    [userId]
  );

  // Actualizar título y descripción de una tarea
  const updateTask = useCallback(async (taskId: string, title: string, description: string) => {
    setError(null);
    try {
      const input: UpdateTaskInput = { title, description };
      await apiUpdateTask(taskId, input);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar la tarea.';
      setError(msg);
      throw err;
    }
  }, []);

  // Eliminar una tarea por ID
  const deleteTask = useCallback(async (taskId: string) => {
    setError(null);
    try {
      await apiDeleteTask(taskId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar la tarea.';
      setError(msg);
      throw err;
    }
  }, []);

  // Alternar el estado de completado
  const toggleTaskCompleted = useCallback(async (taskId: string, completed: boolean) => {
    setError(null);
    try {
      await apiToggleTaskCompleted(taskId, completed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cambiar el estado de la tarea.';
      setError(msg);
      throw err;
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompleted,
  };
}
