import React, { useState } from 'react';

interface TaskFormProps {
  onSubmit: (
    title: string,
    description: string,
    priority: 'low' | 'medium' | 'high',
    dueDate?: string
  ) => Promise<void>;
  initialTitle?: string;
  initialDescription?: string;
  initialPriority?: 'low' | 'medium' | 'high';
  initialDueDate?: string;
  submitButtonText?: string;
  onCancel?: () => void;
}

/**
 * FORMULARIO DE TAREA (TaskForm):
 * 
 * Componente visual reutilizable tanto para la creación como para la edición
 * de tareas. Maneja validación local y estados visuales de carga.
 */
export const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  initialTitle = '',
  initialDescription = '',
  initialPriority = 'medium',
  initialDueDate = '',
  submitButtonText = 'Guardar',
  onCancel,
}) => {
  const [title, setTitle] = useState<string>(initialTitle);
  const [description, setDescription] = useState<string>(initialDescription);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(initialPriority);
  const [dueDate, setDueDate] = useState<string>(initialDueDate);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación básica previa local
    if (title.trim() === '') {
      setError('El título es obligatorio.');
      return;
    }
    if (description.trim() === '') {
      setError('La descripción es obligatoria.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(title.trim(), description.trim(), priority, dueDate || undefined);
      // Si no es edición, limpiamos el formulario tras crear la tarea
      if (!onCancel) {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDueDate('');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al procesar la tarea.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      {error && <div className="task-error-alert">{error}</div>}
      
      <div className="form-group">
        <label className="form-label" htmlFor="task-title">Título</label>
        <input
          id="task-title"
          type="text"
          className="form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Planificar reunión"
          disabled={submitting}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="task-desc">Descripción</label>
        <textarea
          id="task-desc"
          className="form-input form-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Definir objetivos del Hito 7 con el equipo..."
          disabled={submitting}
          required
        />
      </div>

      {/* Agrupamiento responsivo de prioridad y vencimiento en una sola fila */}
      <div className="task-form-row">
        {/* Control de Prioridad */}
        <div className="form-group">
          <label className="form-label" htmlFor="task-priority">Prioridad</label>
          <select
            id="task-priority"
            className="form-input"
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            disabled={submitting}
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
        </div>

        {/* Control de Fecha de Vencimiento */}
        <div className="form-group">
          <label className="form-label" htmlFor="task-duedate">Fecha de Vencimiento (Opcional)</label>
          <input
            id="task-duedate"
            type="date"
            className="form-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={submitting}
          />
        </div>
      </div>

      <div className="task-form-actions">
        {onCancel && (
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="btn-primary"
          disabled={submitting}
        >
          {submitting ? <div className="spinner" /> : submitButtonText}
        </button>
      </div>
    </form>
  );
};
