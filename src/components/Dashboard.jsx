export default function Dashboard({ chamados }) {
  return (
    <section>
      <h2>Dashboard</h2>

      <div className="cards">
        <div className="card"><h3>{chamados.length}</h3><p>Total de chamados</p></div>
        <div className="card"><h3>{chamados.filter(c => c.status === 'Aberto').length}</h3><p>Abertos</p></div>
        <div className="card"><h3>{chamados.filter(c => c.status === 'Em andamento').length}</h3><p>Em andamento</p></div>
        <div className="card"><h3>{chamados.filter(c => c.status === 'Resolvido').length}</h3><p>Resolvidos</p></div>
        <div className="card"><h3>{chamados.filter(c => c.nivel === 'Crítico').length}</h3><p>Críticos</p></div>
      </div>
    </section>
  )
}
