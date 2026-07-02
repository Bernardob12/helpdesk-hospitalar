import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { protocolo, classeStatus } from '../utils/formatters'

export default function Consultas({
  usuarioLogado,
  usuarios,
  consulta,
  categorias,
  pesquisa,
  setPesquisa
}) {
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  const [usuarioBusca, setUsuarioBusca] = useState('')
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null)
  const [resultadoPeriodo, setResultadoPeriodo] = useState([])

  const [resultadoSemChamados, setResultadoSemChamados] = useState([])

  const [categoriaSelecionada, setCategoriaSelecionada] = useState('')
  const [resultadoSemCategoria, setResultadoSemCategoria] = useState([])

  const usuariosSugeridos = usuarios.filter(u =>
    usuarioBusca &&
    (
      u.nome.toLowerCase().includes(usuarioBusca.toLowerCase()) ||
      u.email.toLowerCase().includes(usuarioBusca.toLowerCase()) ||
      u.setor.toLowerCase().includes(usuarioBusca.toLowerCase())
    )
  ).slice(0, 6)

  const chamadosResolvidosFiltrados = consulta.filter(c => {
    const categoriaNome = c.categoria_dados?.nome || c.categoria || ''

    const batePesquisa =
      protocolo(c.id).toLowerCase().includes(pesquisa.toLowerCase()) ||
      c.titulo.toLowerCase().includes(pesquisa.toLowerCase()) ||
      categoriaNome.toLowerCase().includes(pesquisa.toLowerCase()) ||
      c.nivel.toLowerCase().includes(pesquisa.toLowerCase()) ||
      c.status.toLowerCase().includes(pesquisa.toLowerCase()) ||
      c.solicitante?.nome?.toLowerCase().includes(pesquisa.toLowerCase()) ||
      c.tecnico?.nome?.toLowerCase().includes(pesquisa.toLowerCase())

    const bateDataInicio = !dataInicio || c.data_abertura >= dataInicio
    const bateDataFim = !dataFim || c.data_abertura <= dataFim

    return c.status === 'Resolvido' && batePesquisa && bateDataInicio && bateDataFim
  })

  async function pesquisarPorUsuarioPeriodo(e) {
    e.preventDefault()

    if (!usuarioSelecionado || !dataInicio || !dataFim) {
      alert('Selecione um usuário e informe o período.')
      return
    }

    const { data, error } = await supabase.rpc('pesquisar_chamados_usuario_periodo', {
      nome_usuario: usuarioSelecionado.nome,
      data_inicio: dataInicio,
      data_fim: dataFim
    })

    if (error) {
      alert('Erro ao executar consulta por usuário e período.')
      return
    }

    setResultadoPeriodo(data || [])
  }

  async function buscarUsuariosSemChamados() {
    const { data, error } = await supabase.rpc('usuarios_sem_chamados')

    if (error) {
      alert('Erro ao buscar usuários sem chamados.')
      return
    }

    setResultadoSemChamados(data || [])
  }

  async function buscarUsuariosSemCategoria(e) {
    e.preventDefault()

    if (!categoriaSelecionada) {
      alert('Selecione uma categoria.')
      return
    }

    const categoria = categorias.find(
      cat => String(cat.id) === String(categoriaSelecionada)
    )

    if (!categoria) {
      alert('Categoria inválida.')
      return
    }

    const { data, error } = await supabase.rpc('usuarios_sem_chamados_por_categoria', {
      categoria_pesquisada: categoria.nome
    })

    if (error) {
      alert('Erro ao executar consulta com NOT IN por categoria.')
      return
    }

    setResultadoSemCategoria(data || [])
  }

  if (usuarioLogado.perfil === 'funcionario') {
    return (
      <section>
        <h2>Chamados solucionados</h2>
        <p>Consulte apenas os seus chamados resolvidos.</p>

        <div className="filters-row">
          <input
            className="search"
            placeholder="Pesquisar meus chamados resolvidos"
            value={pesquisa}
            onChange={e => setPesquisa(e.target.value)}
          />

          <input
            type="date"
            value={dataInicio}
            onChange={e => setDataInicio(e.target.value)}
          />

          <input
            type="date"
            value={dataFim}
            onChange={e => setDataFim(e.target.value)}
          />
        </div>

        <TabelaResolvidos chamados={chamadosResolvidosFiltrados} />
      </section>
    )
  }

  return (
    <section>
      <h2>Consultas</h2>
      <p>Consultas qualificadas, joins e subconsultas SQL.</p>

      <div className="consulta-bloco">
        <h3>1. Chamados resolvidos</h3>

        <input
          className="search"
          placeholder="Pesquisar chamados resolvidos"
          value={pesquisa}
          onChange={e => setPesquisa(e.target.value)}
        />

        <TabelaResolvidos chamados={chamadosResolvidosFiltrados} />
      </div>

      <div className="consulta-bloco">
        <h3>2. Pesquisa por usuário e período</h3>
        <p>Digite parte do nome, e-mail ou setor. Depois selecione o usuário.</p>

        <form onSubmit={pesquisarPorUsuarioPeriodo}>
          <div className="autocomplete">
            <input
              placeholder="Pesquisar usuário"
              value={usuarioBusca}
              onChange={e => {
                setUsuarioBusca(e.target.value)
                setUsuarioSelecionado(null)
              }}
            />

            {usuariosSugeridos.length > 0 && (
              <div className="suggestions">
                {usuariosSugeridos.map(u => (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => {
                      setUsuarioSelecionado(u)
                      setUsuarioBusca(`${u.nome} - ${u.setor}`)
                    }}
                  >
                    <strong>{u.nome}</strong>
                    <span>{u.email} • {u.setor}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <input
            type="date"
            value={dataInicio}
            onChange={e => setDataInicio(e.target.value)}
          />

          <input
            type="date"
            value={dataFim}
            onChange={e => setDataFim(e.target.value)}
          />

          <button className="btn-primary">Pesquisar</button>
        </form>

        {resultadoPeriodo.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Protocolo</th>
                <th>Título</th>
                <th>Status</th>
                <th>Nível</th>
                <th>Data</th>
                <th>Solicitante</th>
                <th>Setor</th>
                <th>Categoria</th>
              </tr>
            </thead>

            <tbody>
              {resultadoPeriodo.map(item => (
                <tr key={item.chamado_id}>
                  <td>{item.protocolo}</td>
                  <td>{item.titulo}</td>
                  <td>{item.status}</td>
                  <td>{item.nivel}</td>
                  <td>{item.data_abertura}</td>
                  <td>{item.solicitante}</td>
                  <td>{item.setor}</td>
                  <td>{item.categoria || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="consulta-bloco">
        <h3>3. Usuários que nunca abriram chamados</h3>
        <p>Subconsulta usando NOT IN.</p>

        <button className="btn-primary" onClick={buscarUsuariosSemChamados}>
          Executar consulta NOT IN
        </button>

        {resultadoSemChamados.length > 0 && (
          <TabelaUsuarios dados={resultadoSemChamados} />
        )}
      </div>

      <div className="consulta-bloco">
        <h3>4. Usuários que nunca abriram chamado em uma categoria</h3>
        <p>Subconsulta com NOT IN usando usuários, chamados e categorias.</p>

        <form onSubmit={buscarUsuariosSemCategoria}>
          <select
            value={categoriaSelecionada}
            onChange={e => setCategoriaSelecionada(e.target.value)}
          >
            <option value="">Selecione uma categoria</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.nome}
              </option>
            ))}
          </select>

          <button className="btn-primary">Executar consulta</button>
        </form>

        {resultadoSemCategoria.length > 0 && (
          <TabelaUsuarios dados={resultadoSemCategoria} mostrarCategoria />
        )}
      </div>
    </section>
  )
}

function TabelaResolvidos({ chamados }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Protocolo</th>
          <th>Título</th>
          <th>Status</th>
          <th>Categoria</th>
          <th>Funcionário</th>
          <th>Cargo</th>
          <th>Setor</th>
          <th>Técnico</th>
          <th>Resposta TI</th>
        </tr>
      </thead>

      <tbody>
        {chamados.map(c => {
          const categoriaNome = c.categoria_dados?.nome || c.categoria || '-'

          return (
            <tr key={c.id}>
              <td>{protocolo(c.id)}</td>
              <td>{c.titulo}</td>
              <td><span className={classeStatus(c.status)}>{c.status}</span></td>
              <td>{categoriaNome}</td>
              <td>{c.solicitante?.nome}</td>
              <td>{c.solicitante?.cargo}</td>
              <td>{c.solicitante?.setor}</td>
              <td>{c.tecnico?.nome || 'Não atribuído'}</td>
              <td>{c.resposta_ti || '-'}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function TabelaUsuarios({ dados, mostrarCategoria = false }) {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>E-mail</th>
          <th>Cargo</th>
          <th>Setor</th>
          {mostrarCategoria && <th>Categoria</th>}
        </tr>
      </thead>

      <tbody>
        {dados.map(u => (
          <tr key={u.usuario_id}>
            <td>{u.usuario_id}</td>
            <td>{u.nome}</td>
            <td>{u.email}</td>
            <td>{u.cargo}</td>
            <td>{u.setor}</td>
            {mostrarCategoria && <td>{u.categoria}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  )
}