import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

interface TaskPayload {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

/**
 * SERVICIO SERVERLESS DE ENVÍO DE EMAIL (api/send-task-summary.ts):
 * 
 * Endpoint de Vercel para procesar y enviar el resumen de tareas por email usando AWS SES.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Restringir el método a solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido. Solo se acepta POST.',
    });
  }

  const { email, tasks } = req.body as { email?: string; tasks?: TaskPayload[] };

  // 2. Validar parámetros requeridos
  if (!email || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: 'El correo electrónico de destino (email) es obligatorio.',
    });
  }

  if (!tasks || !Array.isArray(tasks)) {
    return res.status(400).json({
      success: false,
      message: 'La lista de tareas (tasks) es obligatoria y debe ser un arreglo.',
    });
  }

  // 3. Obtener variables de entorno del servidor de AWS
  const awsRegion = process.env.AWS_REGION;
  const awsAccessKey = process.env.AWS_ACCESS_KEY_ID;
  const awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY;
  const sesFromEmail = process.env.AWS_SES_FROM_EMAIL;

  // 4. Validar credenciales de servidor
  if (!awsRegion || !awsAccessKey || !awsSecretKey || !sesFromEmail) {
    console.error('Falta configuración de AWS en las variables de entorno del servidor.');
    return res.status(500).json({
      success: false,
      message: 'El servicio de correo no está configurado correctamente en el servidor.',
    });
  }

  // 5. Calcular estadísticas
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;

  // 6. Construir cuerpo del email
  const htmlTasksList = tasks
    .map(
      t => `
      <li style="margin-bottom: 12px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; list-style: none; background-color: ${t.completed ? '#f7fafc' : '#ffffff'};">
        <span style="font-weight: bold; color: ${t.completed ? '#718096' : '#2d3748'}; text-decoration: ${t.completed ? 'line-through' : 'none'};">
          ${t.completed ? '✅' : '⏳'} ${t.title}
        </span>
        <p style="margin: 4px 0 0 24px; color: #4a5568; font-size: 14px;">${t.description}</p>
      </li>`
    )
    .join('');

  const emailHtml = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #aa3bff; margin-top: 0;">Resumen de Tareas</h2>
      <p style="color: #6b6375; font-size: 16px;">Aquí tenés el estado actual de tu lista de tareas:</p>
      
      <div style="display: flex; gap: 16px; margin: 20px 0; padding: 16px; background-color: #f4f3ec; border-radius: 8px; justify-content: space-around; text-align: center;">
        <div>
          <span style="display: block; font-size: 24px; font-weight: bold; color: #08060d;">${total}</span>
          <span style="font-size: 12px; color: #6b6375; text-transform: uppercase;">Total</span>
        </div>
        <div>
          <span style="display: block; font-size: 24px; font-weight: bold; color: #10b981;">${completed}</span>
          <span style="font-size: 12px; color: #6b6375; text-transform: uppercase;">Completadas</span>
        </div>
        <div>
          <span style="display: block; font-size: 24px; font-weight: bold; color: #f59e0b;">${pending}</span>
          <span style="font-size: 12px; color: #6b6375; text-transform: uppercase;">Pendientes</span>
        </div>
      </div>

      <h3 style="color: #08060d; border-bottom: 2px solid #e5e4e7; padding-bottom: 8px;">Detalle</h3>
      <ul style="padding: 0; margin: 0;">
        ${total === 0 ? '<li style="list-style: none; color: #6b6375;">No tenés tareas registradas.</li>' : htmlTasksList}
      </ul>
      
      <p style="margin-top: 30px; font-size: 12px; color: #6b6375; text-align: center; border-top: 1px solid #e5e4e7; padding-top: 12px; opacity: 0.8;">
        Enviado automáticamente por el Gestor de Tareas SPA.
      </p>
    </div>
  `;

  // 7. Enviar por AWS SES
  try {
    const sesClient = new SESClient({
      region: awsRegion,
      credentials: {
        accessKeyId: awsAccessKey,
        secretAccessKey: awsSecretKey,
      },
    });

    const command = new SendEmailCommand({
      Source: sesFromEmail,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Charset: 'UTF-8',
          Data: 'Resumen de tu Gestor de Tareas',
        },
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: emailHtml,
          },
        },
      },
    });

    await sesClient.send(command);

    return res.status(200).json({
      success: true,
      message: 'Resumen enviado con éxito por correo electrónico.',
    });
  } catch (error: unknown) {
    console.error('Error al enviar el email por AWS SES:', error);
    return res.status(500).json({
      success: false,
      message: 'No pudimos enviar el email. Verificá la configuración del servidor.',
    });
  }
}
