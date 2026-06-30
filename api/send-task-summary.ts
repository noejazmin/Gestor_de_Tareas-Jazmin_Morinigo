import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

interface TaskPayload {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

/**
 * ESCAPE DE HTML (Sanitización básica):
 * 
 * COMENTARIO DIDÁCTICO:
 * - Dado que 'title' y 'description' son ingresados libremente por los usuarios finales,
 *   es indispensable sanitizar las entradas para prevenir ataques de inyección HTML o XSS
 *   en los clientes de correo que visualicen este resumen.
 */
function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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

  const today = new Date().toISOString().split('T')[0];
  const todayDate = new Date().toLocaleDateString('es-AR');

  // 5. Calcular estadísticas (incluyendo tareas vencidas)
  // COMENTARIO DIDÁCTICO:
  // - Una tarea está 'vencida' solo si no está completada y su fecha de vencimiento es previa al día de hoy.
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const overdue = tasks.filter(t => {
    if (t.completed || !t.dueDate) return false;
    return t.dueDate < today;
  }).length;

  // 6. Construir listado de tareas HTML
  const htmlTasksList = tasks
    .map((t) => {
      const isTaskOverdue = t.dueDate && !t.completed && t.dueDate < today;
      const priorityLabel = t.priority === 'high' ? 'Alta' : t.priority === 'medium' ? 'Media' : 'Baja';
      
      // Colores del badge de prioridad en HTML Email
      let priorityBg = '#f5f3ff';
      let priorityBorder = '#ddd6fe';
      let priorityText = '#7c3aed';
      if (t.priority === 'high') {
        priorityBg = '#fef2f2';
        priorityBorder = '#fecaca';
        priorityText = '#ef4444';
      } else if (t.priority === 'low') {
        priorityBg = '#ecfdf5';
        priorityBorder = '#a7f3d0';
        priorityText = '#10b981';
      }

      const escapedTitle = escapeHtml(t.title);
      const escapedDesc = escapeHtml(t.description);

      return `
      <tr style="border-bottom: 1px solid #edf2f7;">
        <td style="padding: 16px 0; background-color: ${t.completed ? '#f8fafc' : '#ffffff'};">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif;">
            <tr>
              <td valign="top" style="width: 24px; padding-right: 8px; font-size: 16px;">
                ${t.completed ? '✅' : '⏳'}
              </td>
              <td>
                <span style="font-size: 14.5px; font-weight: bold; color: ${t.completed ? '#718096' : '#1a202c'}; text-decoration: ${t.completed ? 'line-through' : 'none'};">
                  ${escapedTitle}
                </span>
                <div style="margin-top: 4px; margin-bottom: 8px; color: #4a5568; font-size: 13.5px; line-height: 1.4;">
                  ${escapedDesc}
                </div>
                <!-- Metadatos de la Tarea en el Email (Prioridad y vencimiento) -->
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding-right: 8px;">
                      <span style="display: inline-block; font-size: 9.5px; font-weight: bold; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background-color: ${priorityBg}; border: 1px solid ${priorityBorder}; color: ${priorityText};">
                        Prioridad: ${priorityLabel}
                      </span>
                    </td>
                    <td style="padding-right: 8px; font-size: 11.5px; color: #718096;">
                      📅 ${t.dueDate ? `Vence: ${t.dueDate}` : 'Sin vencimiento'}
                    </td>
                    ${
                      isTaskOverdue
                        ? `<td>
                            <span style="display: inline-block; font-size: 9.5px; font-weight: bold; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background-color: #fef2f2; border: 1px solid #fecaca; color: #ef4444;">
                              ⚠️ Vencida
                            </span>
                          </td>`
                        : ''
                    }
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      `;
    })
    .join('');

  // 7. Construir Plantilla HTML Completa (Optimizada para Clientes de Email)
  // COMENTARIO DIDÁCTICO:
  // - Evitamos flexbox/grid ya que muchos clientes clásicos de correo (como Outlook o clientes móviles antiguos)
  //   no los interpretan correctamente. Usamos layouts tradicionales de tablas para asegurar coherencia visual.
  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resumen de Tareas</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 20px 0;">
          <tr>
            <td>
              <!-- Contenedor central -->
              <table width="600" align="center" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                <!-- Header con Banner -->
                <tr>
                  <td style="background-color: #0e7490; padding: 24px; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: -0.5px;">Resumen de Tareas</h2>
                    <p style="color: #cffafe; margin: 4px 0 0 0; font-size: 13.5px;">Estado actual de tus pendientes al ${todayDate}</p>
                  </td>
                </tr>
                
                <!-- KPIs Grid (Diseñado con Tablas compatibles) -->
                <tr>
                  <td style="padding: 24px 24px 12px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <!-- Total -->
                        <td width="23%" align="center" style="background-color: #f1f5f9; border-radius: 8px; border-left: 3px solid #64748b; padding: 12px;">
                          <span style="display: block; font-size: 20px; font-weight: bold; color: #0f172a; margin-bottom: 2px;">${total}</span>
                          <span style="font-size: 9.5px; font-weight: bold; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Total</span>
                        </td>
                        <td width="2%">&nbsp;</td>
                        <!-- Completadas -->
                        <td width="23%" align="center" style="background-color: #f1f5f9; border-radius: 8px; border-left: 3px solid #10b981; padding: 12px;">
                          <span style="display: block; font-size: 20px; font-weight: bold; color: #10b981; margin-bottom: 2px;">${completed}</span>
                          <span style="font-size: 9.5px; font-weight: bold; text-transform: uppercase; color: #10b981; letter-spacing: 0.5px;">Completas</span>
                        </td>
                        <td width="2%">&nbsp;</td>
                        <!-- Pendientes -->
                        <td width="23%" align="center" style="background-color: #f1f5f9; border-radius: 8px; border-left: 3px solid #7c3aed; padding: 12px;">
                          <span style="display: block; font-size: 20px; font-weight: bold; color: #7c3aed; margin-bottom: 2px;">${pending}</span>
                          <span style="font-size: 9.5px; font-weight: bold; text-transform: uppercase; color: #7c3aed; letter-spacing: 0.5px;">Pendientes</span>
                        </td>
                        <td width="2%">&nbsp;</td>
                        <!-- Vencidas -->
                        <td width="23%" align="center" style="background-color: #f1f5f9; border-radius: 8px; border-left: 3px solid #ef4444; padding: 12px;">
                          <span style="display: block; font-size: 20px; font-weight: bold; color: #ef4444; margin-bottom: 2px;">${overdue}</span>
                          <span style="font-size: 9.5px; font-weight: bold; text-transform: uppercase; color: #ef4444; letter-spacing: 0.5px;">Vencidas</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Título Detalle -->
                <tr>
                  <td style="padding: 12px 24px 8px 24px;">
                    <h3 style="color: #0f172a; margin: 0; font-size: 15px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">Detalle de tareas</h3>
                  </td>
                </tr>

                <!-- Listado de tareas -->
                <tr>
                  <td style="padding: 0 24px 24px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      ${total === 0 ? '<tr><td style="padding: 16px 0; color: #64748b; font-size: 14px; text-align: center;">No tenés tareas registradas.</td></tr>' : htmlTasksList}
                    </table>
                  </td>
                </tr>

                <!-- Footer del Email -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #edf2f7;">
                    <p style="margin: 0; font-size: 11px; color: #64748b; opacity: 0.85;">
                      Enviado automáticamente por el Gestor de Tareas SPA.<br>
                      Por favor, no respondas a este correo.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  // 8. Construir Resumen de Texto Plano Fallback
  const textTasksList = tasks
    .map((t, idx) => {
      const statusSymbol = t.completed ? '[✅ Completada]' : '[⏳ Pendiente]';
      const priorityLabel = t.priority === 'high' ? 'Alta' : t.priority === 'medium' ? 'Media' : 'Baja';
      const isTaskOverdue = t.dueDate && !t.completed && t.dueDate < today;
      const overdueLabel = isTaskOverdue ? ' (¡VENCIDA!)' : '';
      const dueLabel = t.dueDate ? ` - Vence: ${t.dueDate}` : ' - Sin vencimiento';
      
      return `${idx + 1}. ${statusSymbol} - ${t.title}\n   Prioridad: ${priorityLabel}${dueLabel}${overdueLabel}\n   Descripción: ${t.description}`;
    })
    .join('\n\n');

  const emailText = `
Resumen de Tareas - ${todayDate}
======================================
Aquí tenés el estado actual de tu lista de tareas:

* Total: ${total}
* Completadas: ${completed}
* Pendientes: ${pending}
* Vencidas: ${overdue}

Detalle de Tareas:
--------------------------------------
${total === 0 ? 'No tenés tareas registradas.' : textTasksList}

--------------------------------------
Enviado automáticamente por el Gestor de Tareas SPA.
  `.trim();

  // 9. Enviar por AWS SES
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
          Text: {
            Charset: 'UTF-8',
            Data: emailText,
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
