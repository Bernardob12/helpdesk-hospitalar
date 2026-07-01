import { protocolo, classeStatus } from '../utils/formatters'

export default function Chamados({ 
  usuarioLogado,
  consulta, 
  pesquisa, 
  setPesquisa,
  chamadoForm,
  setChamadoForm,
  onAbrirChamado,
  onDetalhes,
  onAssumir
}) {
  const chamadosAtivosFiltrados = consulta.filter(c =>
    c.status !== 'Resolvido' &&
    (
      protocolo(c.id).toLowerCase().includes(pesquisa.toLowerCase()) ||
      c.titulo.toLowerCase().includes(pesquisa.toLowerCase()) ||
      c.categoria.toLowerCase().includes(pesquisa.toLowerCase()) ||
      c.nivel.toLowerCase().includes(pesquisa.toLowerCase()) ||
      c.status.toLowerCase().includes(pesquisa.toLowerCase()) ||
      c.solicitante?.nome?.toLowerCase().includes(pesquisa.toLowerCase())
    )
  )

  // Se for funcionário, mostrar tela de abrir chamado
  if (usuarioLogado.perfil === 'funcionario') {
    return (
      <section>
        <h2>Abrir Chamado</h2>

        <form onSubmit={onAbrirChamado}>
          <input
            placeholder="Título do chamado"
            value={chamadoForm.titulo}
            onChange={e => setChamadoForm({ ...chamadoForm, titulo: e.target.value })}
            required
          />

          <input
            placeholder="Descrição do problema"
            value={chamadoForm.descricao}
            onChange={e => setChamadoForm({ ...chamadoForm, descricao: e.target.value })}
            required
          />

          <select
            value={chamadoForm.categoria}
            onChange={e => setChamadoForm({ ...chamadoForm, categoria: e.target.value })}
          >
            <option>Sistemas</option>
            <option>Infraestrutura</option>
            <option>Impressora</option>
            <option>Rede</option>
            <option>Hardware</option>
            <option>Acesso/Login</option>
            <option>Outro</option>
          </select>

          <select
            value={chamadoForm.nivel}
            onChange={e => setChamadoForm({ ...chamadoForm, nivel: e.target.value })}
          >
            <option>Baixo</option>
            <option>Médio</option>
            <option>Alto</option>
            <option>Crítico</option>
          </select>

          <button>Abrir chamado</button>
        </form>
      </section>
    )
  }

  // Para técnicos e admins, mostrar tela de gerenciamento
  return (
    <section>
      <h2>{usuarioLogado.perfil === 'funcionario' ? 'Meus Chamados' : 'Chamados Solicitados'}</h2>

      <input
        className="search"
        placeholder="Pesquisar chamados ativos"
        value={pesquisa}
        onChange={e => setPesquisa(e.target.value)}
      />

      <table>
        <thead>
          <tr>
            <th>Protocolo</th>
            <th>Título</th>
            <th>Solicitante</th>
            <th>Categoria</th>
            <th>Nível</th>
            <th>Status</th>
            <th>Responsável</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {chamadosAtivosFiltrados.map(c => (
            <tr key={c.id}>
              <td>{protocolo(c.id)}</td>
              <td>{c.titulo}</td>
              <td>{c.solicitante?.nome}</td>
              <td>{c.categoria}</td>
              <td>{c.nivel}</td>
              <td><span className={classeStatus(c.status)}>{c.status}</span></td>
              <td>{c.tecnico?.nome || 'Não assumido'}</td>
              <td>
                <button onClick={() => onDetalhes(c)}>Detalhes</button>

                {c.status !== 'Resolvido' && (
                  <>
                    {c.tecnico_id === usuarioLogado.id ? (
                      <span className="status andamento">Assumido por você</span>
                    ) : (
                      <button onClick={() => onAssumir(c.id)}>
                        {c.tecnico_id ? 'Assumir para mim' : 'Assumir'}
                      </button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
