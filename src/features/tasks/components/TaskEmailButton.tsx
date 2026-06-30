import React, { useState, useEffect } from 'react';
import type { Task } from '../taskTypes';
import { sendTaskSummaryEmail } from '../taskEmailService';

interface TaskEmailButtonProps {
  email: string | null | undefined;
  tasks: Task[];
}

/**
 * BOTÓN DE ENVÍO DE EMAIL DE TAREAS (TaskEmailButton):
 * 
 * Componente visual que interactúa con el servicio de correo.
 * Muestra el estado de envío (cargando), alertas de error y éxito auto-limpiables.
 */
export const TaskEmailButton: React.FC<TaskEmailButtonProps> = ({ email, tasks }) => {
  const [sending, setSending] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Limpiar mensajes temporales después de 4 segundos
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (successMsg || errorMsg) {
      timer = setTimeout(() => {
        setSuccessMsg(null);
        setErrorMsg(null);
      }, 4000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [successMsg, errorMsg]);

  const handleSendEmail = async () => {
    if (!email) {
      setErrorMsg('No se detectó un correo electrónico de usuario válido.');
      return;
    }

    setSending(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    // Mapeamos las tareas para enviar únicamente los campos necesarios incluyendo prioridad y vencimiento
    const mappedTasks = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      completed: t.completed,
      priority: t.priority,
      dueDate: t.dueDate,
    }));

    try {
      const response = await sendTaskSummaryEmail({
        email,
        tasks: mappedTasks,
      });

      if (response.success) {
        setSuccessMsg(response.message);
      } else {
        setErrorMsg(response.message);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error inesperado al enviar el resumen.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="task-email-container">
      <button
        onClick={handleSendEmail}
        className="btn-primary btn-email"
        disabled={sending}
      >
        {sending ? (
          <>
            <div className="spinner" style={{ marginRight: '8px' }} />
            Enviando...
          </>
        ) : (
          '✉️ Enviar resumen por email'
        )}
      </button>

      {successMsg && (
        <div className="task-email-alert success">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="task-email-alert error">
          {errorMsg}
        </div>
      )}
    </div>
  );
};
