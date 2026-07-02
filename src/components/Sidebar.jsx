export default function Sidebar({ usuarioLogado, tela, setTela, onLogout }) {
  return (
    <aside>
      <h1>HelpDesk Hospitalar</h1>
      <p>{usuarioLogado.nome}</p>
      <p className="perfil">{usuarioLogado.perfil.toUpperCase()}</p>

      <button
        className={tela === 'dashboard' ? 'menu-active' : ''}
        onClick={() => setTela('dashboard')}
      >
        Dashboard
      </button>

      {usuarioLogado.perfil === 'admin' && (
        <button
          className={tela === 'usuarios' ? 'menu-active' : ''}
          onClick={() => setTela('usuarios')}
        >
          Usuários
        </button>
      )}

      <button
        className={tela === 'chamados' ? 'menu-active' : ''}
        onClick={() => setTela('chamados')}
      >
        {usuarioLogado.perfil === 'funcionario' ? 'Meus chamados' : 'Chamados'}
      </button>

      <button
        className={tela === 'consultas' ? 'menu-active' : ''}
        onClick={() => setTela('consultas')}
      >
        {usuarioLogado.perfil === 'funcionario' ? 'Chamados solucionados' : 'Consultas'}
      </button>

      <button className="danger-menu" onClick={onLogout}>
        Sair
      </button>
    </aside>
  )
}