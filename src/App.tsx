import './App.css'

function App() {
  return (
    <main className="app-container">
      <header className="app-header">
        <span className="badge">Hito 1: Setup Inicial</span>
        <h1>Gestor de Tareas</h1>
        <p className="subtitle">
          Sistema de Gestión de Tareas para Empleados - PI4
        </p>
      </header>

      <section className="status-section">
        <div className="status-card">
          <h3>Estado del Proyecto</h3>
          <p>La estructura inicial del proyecto ha sido configurada y limpiada correctamente.</p>
          <div className="status-list">
            <div className="status-item checked">
              <span className="icon">✓</span> Plantilla limpia de demos
            </div>
            <div className="status-item checked">
              <span className="icon">✓</span> Estructura de carpetas creada
            </div>
            <div className="status-item checked">
              <span className="icon">✓</span> Configuración de entorno (.env.example) lista
            </div>
            <div className="status-item pending">
              <span className="icon">○</span> Conexión con Firebase (Hito posterior)
            </div>
          </div>
        </div>
      </section>

      <footer className="app-footer">
        <p>Proyecto Integrador 4</p>
      </footer>
    </main>
  )
}

export default App

