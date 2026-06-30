# Gestor de Tareas para Empleados SPA - Henry PI4

Este proyecto es una Single Page Application (SPA) para la gestión de tareas de empleados, desarrollada como parte del **Proyecto Integrador 4 (PI4)** en **Henry**. 
Su propósito es facilitar una plataforma ágil, segura y reactiva en tiempo real para organizar los flujos de trabajo laborales de una organización.

---

## 🛠️ Stack Tecnológico

El proyecto utiliza el siguiente conjunto de tecnologías obligatorias:

* **Frontend**: React 19 + TypeScript + Vite (Entorno de desarrollo ágil)
* **Enrutamiento**: React Router v7 (Control de navegación SPA)
* **Autenticación**: Firebase Authentication (Conexión segura y persistente)
* **Base de Datos**: Cloud Firestore (Base de datos NoSQL reactiva en la nube)
* **Notificaciones**: AWS SES (Simple Email Service) mediante Vercel Serverless Functions
* **Testing**: Vitest + React Testing Library (Pruebas unitarias y de integración en JSDOM)
* **Despliegue & Hosting**: Vercel

---

## 📂 Arquitectura y Organización de Carpetas

El proyecto está diseñado siguiendo una arquitectura de capas bien definida, donde se desacopla la interfaz de usuario (UI) de la lógica de negocio y las llamadas a base de datos o APIs externas.

```text
gestor_de_tareas_pi4/
├── api/                   # Funciones serverless del backend (Vercel Functions)
│   └── send-task-summary.ts # Endpoint para procesar y enviar email por AWS SES
├── tests/                 # Setup de pruebas globales de Vitest
│   └── setup.ts           # Extensión de matchers con jest-dom
├── src/
│   ├── assets/            # Recursos estáticos (estilos globales, logos)
│   ├── components/        # Componentes genéricos y reutilizables
│   ├── features/          # Lógica de negocio agrupada por funcionalidad
│   │   ├── auth/          # Contexto, servicios, validaciones y estilos de Auth
│   │   └── tasks/         # CRUD de tareas, hooks, componentes (TaskForm, TaskList, TaskItem), estilos e integración de email
│   ├── hooks/             # Custom Hooks transversales (ej. useAuth)
│   ├── pages/             # Páginas/vistas de la SPA (Login, Register, Tasks)
│   ├── routes/            # Configuración de rutas públicas y protegidas
│   ├── services/          # Inicialización y configuración SDK de Firebase
│   ├── App.css            # Estilos base
│   ├── App.tsx            # Enrutador principal y composición de la aplicación
│   ├── index.css          # Variables de diseño y tema visual general
│   └── main.tsx           # Punto de entrada de React
├── vercel.json            # Configuración de reescrituras de Vercel para soporte SPA
├── tsconfig.json          # Configuración del compilador TypeScript
└── package.json           # Dependencias y scripts
```

---

## ⚙️ Decisiones Arquitectónicas Importantes

1. **Desacoplamiento UI / Servicio**: Las llamadas directas a Firebase y las llamadas HTTP externas no residen dentro de los componentes visuales. Se aíslan en archivos de servicio (`authService.ts`, `taskService.ts`, `taskEmailService.ts`).
2. **Gestión de Estados Centralizada**: 
   - El estado de autenticación y sesión se administra globalmente a través del `AuthContext.tsx` y se accede desde el custom hook `useAuth.ts`.
   - El estado de la lista de tareas y las operaciones de sincronización en tiempo real se controlan a través del hook personalizado `useTasks.ts`.
3. **Cero Estilos Inline**: Los estilos visuales están encapsulados por completo en archivos `.css` (como `tasks.css` y `auth.css`), asignando identificadores de clase (`className`) para facilitar el mantenimiento y la consistencia del diseño.
4. **Tipado Estricto**: No se permite la utilización de `any` en ningún archivo del proyecto. Todo parámetro, payload o retorno cuenta con definiciones de interfaces claras en TypeScript.

---

## 🌟 Funcionalidades Implementadas

* **Registro e Inicio de Sesión**:
  - Registro de cuenta mediante Email y Contraseña.
  - Inicio de sesión con Email/Password o con botón interactivo de **Google Sign-In** vía ventana emergente (popup).
  - Control unificado de errores didácticos para evitar la enumeración de correos.
* **Seguridad y Enrutamiento**:
  - Rutas públicas (`/login`, `/register`) y privadas (`/tasks`) protegidas de forma inteligente.
  - Persistencia de sesión automática que mantiene al empleado conectado al actualizar la pantalla.
* **Gestión de Tareas (CRUD en tiempo real)**:
  - Crear tareas asignando Título y Descripción.
  - Editar campos de tareas de forma cómoda mediante formularios inline.
  - Cambiar el estado completado/pendiente instantáneamente (check).
  - Eliminar tareas con ventanas nativas de confirmación.
  - **Sincronización en tiempo real**: Mediante `onSnapshot`, cualquier adición, eliminación o cambio se propaga instantáneamente en la interfaz de todos los dispositivos conectados sin recargar.
  - **Aislamiento de Datos**: Cada usuario ve y opera única y exclusivamente sobre sus propias tareas, validado mediante reglas de seguridad de Firestore (`firestore.rules`).
* **Resumen de Tareas por Email**:
  - Botón integrado en la UI que envía al correo del usuario autenticado un reporte visual e interactivo HTML que resume el total de tareas, completadas, pendientes y sus detalles, utilizando AWS SES de forma segura en el servidor.
* **Filtros y Ordenamientos (Hito 9)**:
  - Filtrar tareas dinámicamente por estado: Todas, Pendientes o Completadas.
  - Ordenar tareas en memoria por: Orden manual (Drag & Drop), Prioridad (Alta > Media > Baja) o Fecha de vencimiento (ubicando al final las tareas sin fecha límite).
* **Prioridad y Fecha de Vencimiento (Hito 9)**:
  - Asignación de prioridad (Baja, Media, Alta) y fecha de vencimiento opcional a cada tarea.
  - Indicador visual si la tarea está atrasada (vencida) mediante bordes y alertas de color rojo.
  - Soporte y compatibilidad hacia atrás: las tareas antiguas que no disponen de prioridad, vencimiento u orden por defecto se adaptan sin romper el funcionamiento.
* **Reordenamiento con Drag & Drop (Hito 9)**:
  - Reordenamiento interactivo vertical de tareas mediante arrastre visual con `@dnd-kit` (incluye drag handles).
  - Habilitado únicamente bajo la opción de "Orden manual".
  - Sincronización transaccional en lote (`writeBatch`) que persiste la nueva secuencia en Firestore de forma atómica.

---

## 🔒 Variables de Entorno Necesarias

Crear un archivo `.env` en la raíz del proyecto basándote en la plantilla `.env.example`:

```env
# Variables del Cliente (Firebase Frontend)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# Variables del Servidor (AWS SES para Serverless Functions en Vercel)
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SES_FROM_EMAIL=
```

---

## 🚀 Instalación y Ejecución Local

### Paso 1: Clonar e Instalar Dependencias
```bash
npm install
```

### Paso 2: Ejecutar el Servidor de Desarrollo
Para levantar la aplicación SPA en tu entorno local:
```bash
npm run dev
```

### Paso 3: Probar las Funciones Serverless de Vercel localmente
Dado que el envío de emails por AWS SES depende de una Vercel Function, para ejecutar localmente tanto el frontend de React como el backend de desarrollo de Vercel de forma integrada:
```bash
# Requiere tener instalado Vercel CLI de forma global (npm install -g vercel)
vercel dev
```

---

## 📋 Scripts Disponibles

* `npm run dev`: Levanta el entorno de desarrollo local de Vite.
* `npm run build`: Compila los archivos del proyecto y genera el bundle estático de producción optimizado en `/dist`, excluyendo los archivos de pruebas.
* `npm run lint`: Ejecuta el analizador estático ESLint para velar por las convenciones de código y la calidad en TypeScript.
* `npm run test`: Inicia Vitest en modo interactivo (*watch*).
* `npm run test:run`: Ejecuta la suite de pruebas unitarias y de integración una única vez, imprimiendo el reporte de pases y cobertura.

---

## 📐 Flujos del Sistema

### A. Flujo de Autenticación
1. El usuario interactúa con `LoginPage` o `RegisterPage`.
2. Se consume `authService.ts` que realiza las peticiones hacia Firebase Auth (SDK).
3. Tras la autenticación, Firebase retorna el objeto de usuario y `AuthContext` actualiza el estado global de la sesión.
4. Las directivas en `ProtectedRoute` y `PublicRoute` interceptan los cambios de estado y manejan las redirecciones pertinentes.

### B. Flujo de Tareas (Firestore)
1. El panel `TasksPage` inicializa el hook `useTasks.ts` pasándole el UID del usuario.
2. El hook se conecta a `taskService.ts` llamando a `subscribeToUserTasks`.
3. Se establece una conexión persistente bidireccional mediante `onSnapshot` que vigila la colección `tasks` en Firestore filtrando por `userId`.
4. Al crear, editar, tildar o borrar, se ejecutan operaciones asíncronas asiladas en el servicio. La base de datos se modifica en la nube y el escuchador `onSnapshot` actualiza la vista de forma transparente para el cliente.

### C. Flujo de Envío de Correo (AWS SES & Vercel Functions)
1. El componente `TaskEmailButton` del frontend mapea las tareas activas y las empaqueta.
2. Se realiza una petición `POST` al endpoint `/api/send-task-summary` administrado por `taskEmailService.ts`.
3. Vercel levanta la función serverless `api/send-task-summary.ts` en un entorno seguro de Node.js.
4. La función lee las credenciales del servidor, realiza cálculos de estadísticas, compila la estructura HTML y utiliza `@aws-sdk/client-ses` para enviar el correo mediante el email emisor configurado.
5. El cliente procesa el JSON de retorno y muestra una alerta interactiva verde o roja según el resultado.

---

## 🧪 Pruebas Automatizadas (Testing)

El proyecto cuenta con cobertura de pruebas unitarias y de integración utilizando **Vitest** y **React Testing Library** con simulación de entorno del navegador mediante **JSDOM**.

### Componentes y Servicios Evaluados:
* **TaskForm**: Asegura el render de inputs, la interceptación y despliegue de validaciones de campos requeridos y el reset de variables tras el submit.
* **TaskList**: Valida el estado vacío didáctico y el renderizado iterable de tareas válidas pasadas por props.
* **TaskItem**: Evalúa el renderizado de campos, las llamadas asíncronas de cambios de estado (checkbox), la activación del formulario inline de edición y el borrado seguro mockeando el cuadro de confirmación nativo `window.confirm`.
* **taskEmailService**: Mockea llamadas de red y valida el correcto direccionamiento de peticiones `fetch`, cabeceras, payloads y retornos HTTP (200, 400 y 500).
* **TaskEmailButton**: Valida restricciones ante ausencia de correos de sesión y estados de visualización de éxito/error temporales tras la resolución del servicio.

---

## 🌍 Despliegue (Deploy) en Vercel

El proyecto está listo para producción y es compatible con el despliegue automático de Vercel. 
Gracias al archivo `vercel.json` configurado en la raíz, Vercel gestiona automáticamente el mapeo de sub-rutas estáticas hacia `index.html` sin romper las llamadas a las Serverless Functions.

* **URL de Producción**: [PEGAR ACA MI URL DE VERCEL]

---

## 🤖 Uso de Inteligencia Artificial

Durante el desarrollo de este proyecto se utilizó un asistente de Inteligencia Artificial (IA) enfocado en:
* Refactorización y limpieza de estilos inline en componentes JSX para centralizarlos en clases CSS.
* Aislamiento de lógica y estructuración de componentes siguiendo buenas prácticas arquitectónicas por capas.
* Estricto tipado en TypeScript para erradicar el uso del tipo `any` y prevenir errores en tiempo de ejecución.
* Diseño y optimización de flujos reactivos de datos en tiempo real mediante integraciones de Firebase SDK y AWS SDK.
