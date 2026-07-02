import { useState } from 'react'
import { protocolo, classeStatus } from '../utils/formatters'

export default function Chamados({
  usuarioLogado,
  consulta,
  pesquisa,
  setPesquisa,
  chamadoForm,
  setChamadoForm,
  categorias,
  onAbrirChamado,
  onDetalhes,
  onAssumir
}) {
  const [modalNovoChamado, setModalNovoChamado] = useState(false)

  const chamadosAtivosFiltrados = consulta.filter(c => {
    const categoriaNome = c.categoria_dados?.nome || c.categoria || ''

    return (
      c.status !== 'Resolvido' &&
      (
        protocolo(c.id).toLowerCase().includes(pesquisa.toLowerCase()) ||
        c.titulo.toLowerCase().includes(pesquisa.toLowerCase()) ||
        categoriaNome.toLowerCase().includes(pesquisa.toLowerCase()) ||
        c.nivel.toLowerCase().includes(pesquisa.toLowerCase()) ||
        c.status.toLowerCase().includes(pesquisa.toLowerCase()) ||
        c.solicitante?.nome?.toLowerCase().includes(pesquisa.toLowerCase())
      )
    )
  })

  async function salvarChamado(e) {
    const sucesso = await onAbrirChamado(e)

    if (sucesso) {
      setModalNovoChamado(false)
    }
  }

  return (
    <section>
      <div className="section-header">
        <div>
          <h2>{usuarioLogado.perfil === 'funcionario' ? 'Meus chamados em aberto' : 'Chamados em atendimento'}</h2>
          <p>Chamados abertos ou em andamento.</p>
        </div>

        {usuarioLogado.perfil === 'funcionario' && (
          <button
            className="btn-primary"
            onClick={() => setModalNovoChamado(true)}
          >
            Novo chamado
          </button>
        )}
      </div>

      <input
        className="search"
        placeholder="Pesquisar por protocolo, título, categoria, status ou solicitante"
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
          {chamadosAtivosFiltrados.map(c => {
            const categoriaNome = c.categoria_dados?.nome || c.categoria || '-'

            return (
              <tr key={c.id}>
                <td>{protocolo(c.id)}</td>
                <td>{c.titulo}</td>
                <td>{c.solicitante?.nome}</td>
                <td>{categoriaNome}</td>
                <td>{c.nivel}</td>
                <td><span className={classeStatus(c.status)}>{c.status}</span></td>
                <td>{c.tecnico?.nome || 'Não assumido'}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn-table" onClick={() => onDetalhes(c)}>
                      Detalhes
                    </button>

                    {(usuarioLogado.perfil === 'tecnico' || usuarioLogado.perfil === 'admin') && c.status !== 'Resolvido' && (
                      <>
                        {c.tecnico_id === usuarioLogado.id ? (
                          <span className="status andamento">Assumido por você</span>
                        ) : (
                          <button className="btn-table" onClick={() => onAssumir(c.id)}>
                            {c.tecnico_id ? 'Assumir para mim' : 'Assumir'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {modalNovoChamado && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h2>Novo chamado</h2>
                <p>Descreva o problema para a equipe de TI.</p>
              </div>

              <button
                className="btn-ghost"
                type="button"
                onClick={() => setModalNovoChamado(false)}
              >
                Fechar
              </button>
            </div>

            <form onSubmit={salvarChamado}>
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
                value={chamadoForm.categoria_id}
                onChange={e => setChamadoForm({ ...chamadoForm, categoria_id: e.target.value })}
                required
              >
                <option value="">Selecione a categoria</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
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

              <button className="btn-primary" type="submit">
                Criar chamado
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}