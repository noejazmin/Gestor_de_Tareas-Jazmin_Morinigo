# Gestor de Tareas para Empleados - Henry PI4

Este proyecto es una Single Page Application (SPA) para la gestión de tareas de empleados, desarrollada como parte del **Proyecto Integrador 4 (PI4)** en **Henry**.

El objetivo principal es construir una plataforma web ágil, segura y escalable que permita coordinar el flujo de trabajo dentro de una organización.

> [!NOTE]
> **Estado del Proyecto:** La estructura de carpetas, configuraciones básicas, dependencias iniciales y plantilla base han sido preparadas y limpiadas.

---

## 🛠️ Stack Tecnológico Obligatorio 

El proyecto utiliza las siguientes tecnologías clave exigidas por la consigna:

- **Frontend:** [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/) (Plantilla `react-ts`)
- **Autenticación:** [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Base de Datos:** [Cloud Firestore](https://firebase.google.com/docs/firestore)
- **Notificaciones de Correo:** [AWS SES](https://aws.amazon.com/es/ses/) mediante [Vercel Functions](https://vercel.com/docs/functions/serverless-functions)
- **Despliegue (Deploy):** [Vercel](https://vercel.com/)
- **Testing:** [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

## 📂 Estructura del Proyecto

El código está estructurado siguiendo una arquitectura clara por capas, separando la UI de la lógica de negocio:

```text
gestor_de_tareas_pi4/
├── functions/             # Serverless Functions (para Vercel / AWS SES)
├── tests/                 # Pruebas unitarias e integración de la app
├── src/
│   ├── assets/            # Recursos estáticos (imágenes, iconos, etc.)
│   ├── components/        # Componentes genéricos y reutilizables (Botones, Inputs, etc.)
│   ├── features/          # Módulos y lógica por funcionalidades (ej. tareas, empleados)
│   ├── hooks/             # Custom Hooks personalizados
│   ├── pages/             # Vistas principales de la aplicación (SPA)
│   ├── routes/            # Configuración de enrutamiento
│   ├── services/          # Integración de APIs externas (Firebase, funciones SES, etc.)
│   ├── types/             # Definición de tipos e interfaces de TypeScript
│   ├── utils/             # Funciones de utilidad y helpers comunes
│   ├── App.css            # Estilos específicos de la aplicación
│   ├── App.tsx            # Componente raíz
│   ├── index.css          # Estilos globales de la aplicación
│   └── main.tsx           # Punto de entrada de la aplicación
├── .env.example           # Plantilla de variables de entorno necesarias
├── .gitignore             # Archivos excluidos del control de versiones
├── package.json           # Dependencias y scripts de ejecución
└── vite.config.ts         # Configuración del empaquetador Vite
```

---

## 🚀 Instrucciones para Ejecución Local

Para levantar el servidor de desarrollo localmente:

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   Copia el archivo `.env.example` y renómbralo a `.env`. Completa las variables correspondientes (no subir este archivo `.env` a Git).
   ```bash
   cp .env.example .env
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:5173](http://localhost:5173) en tu navegador para ver la aplicación ejecutándose.

4. **Ejecutar linters:**
   ```bash
   npm run lint
   ```

---

## 📋 Criterios de Evaluación y Buenas Prácticas

Este repositorio está alineado con la rúbrica de evaluación de Henry:
- **Arquitectura de capas:** Clara separación de responsabilidades.
- **Tipado estricto:** Evitando el uso de `any` y utilizando tipos TypeScript consistentes y explícitos.
- **Componentes reutilizables:** Principio DRY (Don't Repeat Yourself).
- **Control de Versiones:** Historial de commits semánticos (`feat:`, `fix:`, `docs:`, `chore:`, etc.).

