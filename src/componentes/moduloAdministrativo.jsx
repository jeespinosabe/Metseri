export function ModuloAdministrativo({ alCerrarSesion }) {
  return (
    <main className="admin-modulo">
      <header className="admin-modulo__cabecera">
        <a className="admin-acceso__marca" href="/">MET<span>S</span>ERI</a>
        <button type="button" onClick={alCerrarSesion}>Cerrar sesión</button>
      </header>
      <section className="admin-modulo__contenido">
        <p className="admin-acceso__sobrelinea">ESPACIO PROTEGIDO</p>
        <h1>Administración</h1>
        <p>Tu sesión está activa. Desde aquí se integrarán las herramientas de gestión de Metseri.</p>
        <div className="admin-modulo__estado"><span aria-hidden="true" /> Acceso autorizado</div>
      </section>
    </main>
  )
}
