export default function Usuarios({ 
  usuarios, 
  pesquisa, 
  setPesquisa, 
  onNovoUsuario, 
  onEditar, 
  onExcluir 
}) {
  const usuariosFiltrados = usuarios.filter(u =>
    u.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
    u.email.toLowerCase().includes(pesquisa.toLowerCase()) ||
    u.perfil.toLowerCase().includes(pesquisa.toLowerCase()) ||
    u.setor.toLowerCase().includes(pesquisa.toLowerCase())
  )

  return (
    <section>
      <div className="section-header">
        <div>
          <h2>Usuários</h2>
          <p>Gerencie funcionários, técnicos e administradores.</p>
        </div>

        <button className="btn-primary" onClick={onNovoUsuario}>Novo usuário</button>
      </div>

      <input
        className="search"
        placeholder="Pesquisar por nome, e-mail, perfil ou setor"
        value={pesquisa}
        onChange={e => setPesquisa(e.target.value)}
      />

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Perfil</th>
            <th>Cargo</th>
            <th>Setor</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {usuariosFiltrados.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.nome}</td>
              <td>{u.email}</td>
              <td>{u.perfil}</td>
              <td>{u.cargo}</td>
              <td>{u.setor}</td>
              <td>
                <button onClick={() => onEditar(u)}>Editar</button>
                <button className="danger" onClick={() => onExcluir(u.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
