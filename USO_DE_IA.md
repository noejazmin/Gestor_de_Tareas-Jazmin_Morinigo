# Documentación del Uso de Inteligencia Artificial (IA) - Henry PI4

Este documento detalla la utilización de asistentes de Inteligencia Artificial (IA) como herramienta de apoyo, guía y pair programming durante el desarrollo del **Proyecto Integrador 4 (PI4)**. 

El enfoque adoptado priorizó el aprendizaje autónomo: la IA se utilizó para esclarecer conceptos, sugerir buenas prácticas y validar la arquitectura del software, manteniendo siempre el control, la comprensión y la validación manual por parte del estudiante.

---

## 💡 ¿Para qué me ayudó la IA?

El asistente de IA brindó soporte en cinco áreas principales:
1. **Modelado y tipado estricto**: Diseño de interfaces claras en TypeScript para el feature de tareas y autenticación, asegurando la erradicación completa del tipo genérico `any`.
2. **Refactorización y limpieza de estilos**: Localización de estilos CSS inline distribuidos en el frontend para migrarlos hacia una estructura limpia basada en selectores CSS clases (className).
3. **Flujos asíncronos y en tiempo real**: Implementación de observadores reactivos en la base de datos con `onSnapshot` de Firestore y estructuración de promesas.
4. **Seguridad y Enrutamiento**: Comprensión del ciclo de vida de tokens de sesión y diseño de componentes envolventes de protección de rutas (`ProtectedRoute` y `PublicRoute`).
5. **Testing Unitario y de Integración**: Configuración de Vitest, aserciones mediante JSDOM y técnicas de simulación de red (*mocking*) para simular APIs de terceros (AWS SES y Fetch).

---

## 🛠️ Prompts Utilizados (Ejemplos Representativos)

A lo largo de los hitos del proyecto se emplearon prompts conversacionales del siguiente estilo:

* **Para Limpieza de Estilos**:
  > *"Tengo este componente LoginPage que tiene estilos CSS inline. Quiero pasarlo a clases de CSS externas respetando el diseño visual. ¿Cómo puedo reorganizarlo en un archivo LoginPage.css y cómo debe verse la importación?"*
* **Para Lógica / UI**:
  > *"Quiero desacoplar la interfaz del listado de tareas de la llamada a la base de datos de Firebase. ¿Cómo puedo crear un custom hook `useTasks` que maneje el estado de carga, error y lista de tareas, y qué métodos del servicio debería consumir?"*
* **Para Entendimiento Técnico**:
  > *"¿Por qué Firestore requiere un índice compuesto cuando realizo un query con filtro de `where` y ordenamiento de `orderBy` al mismo tiempo? Explicame el motivo paso a paso y cómo resolverlo de forma alternativa en memoria."*
* **Para Pruebas Unitarias**:
  > *"Necesito testear mi componente `TaskEmailButton` usando Vitest y React Testing Library. ¿Cómo puedo simular la respuesta de red de mi servicio fetch para simular éxito y error sin hacer llamadas reales?"*

---

## 🧠 Decisiones Técnicas Tomadas con Apoyo de IA

* **Evitar el uso de `any`**: La IA sugirió utilizar tipos utilitarios de TypeScript (como `Pick<Task, 'id' | 'title' | ...>`) para transferir de manera segura únicamente los campos mínimos necesarios al backend serverless, asegurando tipados limpios e inmutables.
* **Manejo de Cierres de Suscripción**: Se decidió de mutuo acuerdo retornar la llamada de cancelación del escuchador (`unsubscribe`) dentro del hook de limpieza `useEffect`. Esto previene fugas de memoria (*memory leaks*) en el cliente al desmontar las pantallas.
* **Ordenamiento de Tareas en Cliente vs. Servidor**: Tras detectar que el ordenamiento por fecha de creación en el servidor forzaba la creación manual de índices compuestos en la consola de Firebase, se decidió simplificar la consulta en el servidor y realizar el ordenamiento en memoria del cliente.
* **Estructura Segura del Servidor Serverless**: Mantener las variables de credenciales de AWS (`AWS_ACCESS_KEY_ID`, etc.) legibles únicamente en la carpeta `api/` (Vercel Functions), evitando su exposición en el frontend del cliente.
* **Estrategia de Reordenamiento con Filtros Activos (Hito 9)**: Para evitar que el drag & drop altere la posición de las tareas ocultas por filtros activos (ej. pendientes), se diseñó un algoritmo para remapear los valores `order` basándose en la lista visible y actualizando solo los ítems modificados a través de `writeBatch` de Firestore.
* **Mockeo de dnd-kit para Testing (Hito 9)**: Con asistencia de la IA, se estructuraron mocks globales para `@dnd-kit/core` y `@dnd-kit/sortable` en `tests/setup.ts` para posibilitar que la suite de Vitest y JSDOM renderice los listados y compile exitosamente sin requerir soporte físico del motor de sensores de puntero.

---

## 🔍 Proceso de Validación y Revisión Manual

Toda sugerencia o bloque de código provisto por la IA pasó por una estricta validación manual por parte del estudiante:

1. **Revisión de Consignas**: Cada línea de código propuesta se comparó críticamente con la rúbrica y las limitaciones del PI4 (ej. prohibición de librerías extras innecesarias, no implementar AWS SES directo en el cliente, etc.).
2. **Entendimiento antes de la Integración**: No se copiaron fragmentos de código sin comprender previamente la función de cada línea. Se solicitaban aclaraciones didácticas de por qué se utilizaban determinadas estructuras o importaciones.
3. **Pruebas en el Entorno**: Cada cambio fue probado manualmente en el navegador web local verificando flujos visuales, y posteriormente compilado utilizando:
   - `npm run lint` (Verificación estática y de convenciones de TypeScript).
   - `npm run build` (Compilación estricta y empaquetado para distribución).
   - `npm run test:run` (Asegurar que los tests unitarios y de integración de Testing Library se ejecutaran con un pase del 100%).
4. **Verificación en Producción**: Tras empujar los cambios y compilar en Vercel, se realizaron pruebas manuales en un navegador en modo incógnito para verificar la interceptación de las rutas protegidas, la persistencia de cookies de sesión de Firebase y la recepción de resúmenes de email HTML a bandejas de entrada reales.
