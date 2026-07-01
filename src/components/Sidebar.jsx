export default function Sidebar({ usuarioLogado, tela, setTela, onLogout }) {
  return (
    <aside>
      <h1>HelpDesk Hospitalar</h1>
      <p>{usuarioLogado.nome}</p>
      <p className="perfil">{usuarioLogado.perfil.toUpperCase()}</p>

      <button onClick={() => setTela('dashboard')}>Dashboard</button>

      {usuarioLogado.perfil === 'admin' && (
        <button onClick={() => setTela('usuarios')}>Usuários</button>
      )}

      {usuarioLogado.perfil === 'funcionario' && (
        <button onClick={() => setTela('abrir')}>Abrir chamado</button>
      )}

      <button onClick={() => setTela('chamados')}>
        {usuarioLogado.perfil === 'funcionario' ? 'Meus chamados' : 'Chamados'}
      </button>

      <button onClick={() => setTela('consultas')}>Consultas</button>
      <button className="danger-menu" onClick={onLogout}>Sair</button>
    </aside>
  )
}
