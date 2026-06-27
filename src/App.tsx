import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TasksPage } from './pages/TasksPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicRoute } from './routes/PublicRoute';
import './App.css';

/**
 * COMPONENTE PRINCIPAL (App.tsx):
 * 
 * Actúa como la composición general de la aplicación y configurador de enrutamiento SPA.
 * 
 * - ¿POR QUÉ APP.tsx NO DEBE TENER TODA LA LÓGICA?
 *   Mantener App.tsx libre de estados complejos de Firebase y de lógica de negocio cumple
 *   con el principio de responsabilidad única. La lógica de Firebase se delega al AuthProvider y
 *   las directivas de acceso a ProtectedRoute y PublicRoute. App.tsx queda como un punto de
 *   composición limpio de las vistas.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección inicial: Si el usuario accede a la raíz, lo redirigimos a '/tasks'.
            Esta ruta activará el componente ProtectedRoute y evaluará si debe ir a /login o quedarse en /tasks. */}
        <Route path="/" element={<Navigate to="/tasks" replace />} />

        {/* RUTAS PÚBLICAS: Solo accesibles para usuarios sin sesión activa (ej. Login y Registro).
            Si ya iniciaron sesión, PublicRoute los redirige automáticamente a /tasks. */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* RUTAS PRIVADAS: Solo accesibles para usuarios con sesión activa (ej. Panel de Tareas).
            Si intentan ingresar sin sesión, ProtectedRoute los redirige automáticamente a /login. */}
        <Route element={<ProtectedRoute />}>
          <Route path="/tasks" element={<TasksPage />} />
        </Route>

        {/* MANEJO DE RUTAS NO EXISTENTES (404) */}
        <Route path="*" element={
          <main className="app-container">
            <header className="app-header">
              <span className="badge">Error 404</span>
              <h1>Página No Encontrada</h1>
            </header>
            <section className="status-section">
              <div className="status-card notfound-card">
                <p className="notfound-text">La página que estás buscando no existe o fue movida.</p>
                <Link to="/tasks" className="btn-primary notfound-link">
                  Volver al Panel
                </Link>
              </div>
            </section>
            <footer className="app-footer">
              <p>Proyecto Integrador 4</p>
            </footer>
          </main>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
