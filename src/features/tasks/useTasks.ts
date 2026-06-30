import { useState, useEffect, useCallback, useMemo } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import type { Task, CreateTaskInput, UpdateTaskInput } from './taskTypes';
import {
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
  toggleTaskCompleted as apiToggleTaskCompleted,
  updateTasksOrder as apiUpdateTasksOrder,
  subscribeToUserTasks,
} from './taskService';

/**
 * HOOK PERSONALIZADO DE TAREAS (useTasks):
 * 
 * Centraliza el estado, gestiona la sincronización en tiempo real con onSnapshot,
 * y aplica filtros y ordenamientos en memoria para desacoplar la UI de la base de datos.
 */
export function useTasks(userId: string | undefined) {
  const [rawTasks, setRawTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros y ordenamiento
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'manual' | 'priority' | 'dueDate'>('manual');

  // Suscribirse a las tareas en tiempo real
  useEffect(() => {
    if (!userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRawTasks([]);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToUserTasks(
      userId,
      (updatedTasks) => {
        setRawTasks(updatedTasks);
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

  // Filtrado y ordenamiento en memoria
  // COMENTARIO DIDÁCTICO:
  // - useMemo recalcula el arreglo solo cuando cambian las tareas, filtros u ordenamientos.
  // - Las tareas sin vencimiento (dueDate) se colocan siempre al final en el ordenamiento por fecha.
  const tasks = useMemo(() => {
    let result = [...rawTasks];

    // 1. Aplicar filtros
    if (filter === 'pending') {
      result = result.filter(t => !t.completed);
    } else if (filter === 'completed') {
      result = result.filter(t => t.completed);
    }

    // 2. Aplicar ordenamientos
    if (sortBy === 'manual') {
      result.sort((a, b) => a.order - b.order);
    } else if (sortBy === 'priority') {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      result.sort((a, b) => {
        const diff = priorityWeight[b.priority] - priorityWeight[a.priority];
        if (diff !== 0) return diff;
        // Fallback cronológico secundario si tienen la misma prioridad
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });
    } else if (sortBy === 'dueDate') {
      result.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        const diff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        if (diff !== 0) return diff;
        // Fallback cronológico secundario
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });
    }

    return result;
  }, [rawTasks, filter, sortBy]);

  // Crear una nueva tarea asignándole el orden menor para colocarla arriba
  const createTask = useCallback(
    async (title: string, description: string, priority: 'low' | 'medium' | 'high' = 'medium', dueDate?: string) => {
      if (!userId) {
        throw new Error('Usuario no autenticado.');
      }
      setError(null);
      try {
        // Para colocar la nueva tarea en el tope del orden manual
        const minOrder = rawTasks.length > 0 ? Math.min(...rawTasks.map(t => t.order)) : 0;
        const order = minOrder - 1;

        const input: CreateTaskInput = {
          title,
          description,
          userId,
          priority,
          dueDate: dueDate || undefined,
          order,
        };
        await apiCreateTask(input);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al crear la tarea.';
        setError(msg);
        throw err;
      }
    },
    [userId, rawTasks]
  );

  // Actualizar todos los campos de una tarea
  const updateTask = useCallback(
    async (taskId: string, title: string, description: string, priority?: 'low' | 'medium' | 'high', dueDate?: string) => {
      setError(null);
      try {
        const input: UpdateTaskInput = {
          title,
          description,
          priority,
          dueDate: dueDate || '', // Vaciar en Firestore si es un string vacío
        };
        await apiUpdateTask(taskId, input);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al actualizar la tarea.';
        setError(msg);
        throw err;
      }
    },
    []
  );

  // Reordenar tareas con arrastre (Drag and drop)
  // COMENTARIO DIDÁCTICO:
  // - Asignamos los valores de orden originales a las nuevas posiciones relativas de las tareas visibles.
  // - Realizamos una actualización optimista local para que la UI no parpadee al arrastrar.
  const reorderTasks = useCallback(
    async (activeId: string, overId: string) => {
      const oldIndex = tasks.findIndex(t => t.id === activeId);
      const newIndex = tasks.findIndex(t => t.id === overId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newTasks = arrayMove(tasks, oldIndex, newIndex);
        const originalOrders = tasks.map(t => t.order);

        // Armamos la lista de actualizaciones para Firestore
        const updates = newTasks.map((t, idx) => ({
          id: t.id,
          order: originalOrders[idx],
        })).filter((upd, idx) => tasks[idx].id !== upd.id);

        if (updates.length > 0) {
          // Actualización optimista local
          setRawTasks(prev => {
            const map = new Map(updates.map(u => [u.id, u.order]));
            return prev.map(t => map.has(t.id) ? { ...t, order: map.get(t.id)! } : t);
          });

          // Guardamos en Firestore
          try {
            await apiUpdateTasksOrder(updates);
          } catch (err) {
            console.error('Error al guardar el orden en Firestore:', err);
            setError('No se pudo guardar la posición en el servidor.');
          }
        }
      }
    },
    [tasks]
  );

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
    filter,
    sortBy,
    setFilter,
    setSortBy,
    createTask,
    updateTask,
    reorderTasks,
    deleteTask,
    toggleTaskCompleted,
  };
}
