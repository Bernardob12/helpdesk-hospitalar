import { protocolo, classeStatus } from '../utils/formatters'

export default function Consultas({ 
  consulta, 
  pesquisa, 
  setPesquisa
}) {
  const chamadosResolvidosFiltrados = consulta.filter(c =>
    c.status === 'Resolvido' &&
    (
      protocolo(c.id).toLowerCase().includes(pesquisa.toLowerCase()) ||
      c.titulo.toLowerCase().includes(pesquisa.toLowerCase()) ||
      c.categoria.toLowerCase().includes(pesquisa.toLowerCase()) ||
      c.nivel.toLowerCase().includes(pesquisa.toLowerCase()) ||
      c.status.toLowerCase().includes(pesquisa.toLowerCase()) ||
      c.solicitante?.nome?.toLowerCase().includes(pesquisa.toLowerCase()) ||
      c.tecnico?.nome?.toLowerCase().includes(pesquisa.toLowerCase())
    )
  )

  return (
    <section>
      <h2>Consultas</h2>
      <p>Chamados resolvidos com dados do solicitante e técnico responsável.</p>

      <input
        className="search"
        placeholder="Pesquisar chamados resolvidos"
        value={pesquisa}
        onChange={e => setPesquisa(e.target.value)}
      />

      <table>
        <thead>
          <tr>
            <th>Protocolo</th>
            <th>Título</th>
            <th>Status</th>
            <th>Funcionário</th>
            <th>Cargo</th>
            <th>Setor</th>
            <th>Técnico</th>
            <th>Resposta TI</th>
          </tr>
        </thead>

        <tbody>
          {chamadosResolvidosFiltrados.map(c => (
            <tr key={c.id}>
              <td>{protocolo(c.id)}</td>
              <td>{c.titulo}</td>
              <td><span className={classeStatus(c.status)}>{c.status}</span></td>
              <td>{c.solicitante?.nome}</td>
              <td>{c.solicitante?.cargo}</td>
              <td>{c.solicitante?.setor}</td>
              <td>{c.tecnico?.nome || 'Não atribuído'}</td>
              <td>{c.resposta_ti || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
