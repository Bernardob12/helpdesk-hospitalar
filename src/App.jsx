import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

function formatarCPF(valor) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function formatarTelefone(valor) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

function protocolo(id) {
  return `HD-${new Date().getFullYear()}-${String(id).padStart(4, '0')}`
}

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null)
  const [emailLogin, setEmailLogin] = useState('')
  const [senhaLogin, setSenhaLogin] = useState('')
  const [erroLogin, setErroLogin] = useState('')

  const [tela, setTela] = useState('dashboard')
  const [usuarios, setUsuarios] = useState([])
  const [chamados, setChamados] = useState([])
  const [consulta, setConsulta] = useState([])

  const [usuarioForm, setUsuarioForm] = useState({
    nome: '',
    email: '',
    senha: '',
    perfil: 'funcionario',
    cpf: '',
    cargo: '',
    setor: '',
    telefone: '',
    ativo: true
  })

  const [chamadoForm, setChamadoForm] = useState({
    titulo: '',
    descricao: '',
    categoria: 'Sistemas',
    nivel: 'Médio'
  })

  const [respostaForm, setRespostaForm] = useState('')
  const [editUsuarioId, setEditUsuarioId] = useState(null)
  const [chamadoSelecionado, setChamadoSelecionado] = useState(null)
  const [pesquisa, setPesquisa] = useState('')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (usuarioLogado) carregarTudo()
  }, [usuarioLogado])

  function mostrarToast(titulo, mensagem) {
    setToast({ titulo, mensagem })
    setTimeout(() => setToast(null), 4500)
  }

  async function login(e) {
    e.preventDefault()
    setErroLogin('')

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', emailLogin)
      .eq('senha', senhaLogin)
      .eq('ativo', true)
      .single()

    if (error || !data) {
      setErroLogin('E-mail ou senha incorretos.')
      return
    }

    setUsuarioLogado(data)
    setTela('dashboard')
  }

  function logout() {
    setUsuarioLogado(null)
    setEmailLogin('')
    setSenhaLogin('')
    setTela('dashboard')
  }

  async function carregarTudo() {
    await carregarUsuarios()
    await carregarChamados()
    await carregarConsulta()
  }

  async function carregarUsuarios() {
    const { data } = await supabase.from('usuarios').select('*').order('id')
    setUsuarios(data || [])
  }

  async function carregarChamados() {
    let query = supabase.from('chamados').select('*').order('id')

    if (usuarioLogado.perfil === 'funcionario') {
      query = query.eq('solicitante_id', usuarioLogado.id)
    }

    const { data } = await query
    setChamados(data || [])
  }

  async function carregarConsulta() {
    let query = supabase
      .from('chamados')
      .select(`
        *,
        solicitante:usuarios!fk_solicitante (
          nome,
          cpf,
          cargo,
          setor,
          email
        ),
        tecnico:usuarios!fk_tecnico (
          nome,
          cargo,
          setor,
          email
        )
      `)
      .order('id')

    if (usuarioLogado.perfil === 'funcionario') {
      query = query.eq('solicitante_id', usuarioLogado.id)
    }

    const { data } = await query
    setConsulta(data || [])
  }

  async function salvarUsuario(e) {
    e.preventDefault()

    if (usuarioForm.cpf && usuarioForm.cpf.length !== 14) {
      alert('CPF inválido. Digite os 11 números.')
      return
    }

    if (editUsuarioId) {
      await supabase.from('usuarios').update(usuarioForm).eq('id', editUsuarioId)
      mostrarToast('Usuário atualizado', 'As informações foram alteradas com sucesso.')
      setEditUsuarioId(null)
    } else {
      await supabase.from('usuarios').insert([usuarioForm])
      mostrarToast('Usuário criado', 'Novo usuário cadastrado com sucesso.')
    }

    setUsuarioForm({
      nome: '',
      email: '',
      senha: '',
      perfil: 'funcionario',
      cpf: '',
      cargo: '',
      setor: '',
      telefone: '',
      ativo: true
    })

    carregarTudo()
  }

  function editarUsuario(u) {
    setUsuarioForm({
      nome: u.nome,
      email: u.email,
      senha: u.senha,
      perfil: u.perfil,
      cpf: u.cpf || '',
      cargo: u.cargo,
      setor: u.setor,
      telefone: u.telefone || '',
      ativo: u.ativo
    })

    setEditUsuarioId(u.id)
  }

  async function excluirUsuario(id) {
    if (!confirm('Deseja excluir este usuário?')) return

    const { error } = await supabase.from('usuarios').delete().eq('id', id)

    if (error) {
      alert('Não é possível excluir usuário com chamados vinculados.')
    } else {
      mostrarToast('Usuário excluído', 'O usuário foi removido com sucesso.')
    }

    carregarTudo()
  }

  async function abrirChamado(e) {
    e.preventDefault()

    const { data, error } = await supabase
      .from('chamados')
      .insert([{
        ...chamadoForm,
        status: 'Aberto',
        solicitante_id: usuarioLogado.id,
        tecnico_id: null,
        resposta_ti: null,
        data_encerramento: null
      }])
      .select()
      .single()

    if (error) {
      alert('Erro ao criar chamado.')
      return
    }

    setChamadoForm({
      titulo: '',
      descricao: '',
      categoria: 'Sistemas',
      nivel: 'Médio'
    })

    mostrarToast(
      'Chamado criado com sucesso',
      `Protocolo ${protocolo(data.id)}. Acompanhe o andamento em Meus Chamados.`
    )

    carregarTudo()
  }

  async function assumirChamado(id) {
    await supabase
      .from('chamados')
      .update({
        status: 'Em andamento',
        tecnico_id: usuarioLogado.id
      })
      .eq('id', id)

    mostrarToast('Chamado assumido', `Você assumiu o chamado ${protocolo(id)}.`)
    carregarTudo()
  }

  async function resolverChamado(id) {
    const chamado = consulta.find(c => c.id === id)

    if (!chamado) {
      alert('Chamado não encontrado.')
      return
    }

    if (chamado.tecnico_id !== usuarioLogado.id) {
      alert('Você precisa assumir este chamado antes de resolvê-lo.')
      return
    }

    if (!respostaForm.trim()) {
      alert('Digite uma resposta da TI antes de resolver o chamado.')
      return
    }

    await supabase
      .from('chamados')
      .update({
        status: 'Resolvido',
        tecnico_id: usuarioLogado.id,
        resposta_ti: respostaForm,
        data_encerramento: new Date().toISOString().split('T')[0]
      })
      .eq('id', id)

    setRespostaForm('')
    setChamadoSelecionado(null)
    mostrarToast('Chamado resolvido', `${protocolo(id)} foi finalizado com sucesso.`)
    carregarTudo()
  }

  function classeStatus(status) {
    if (status === 'Resolvido') return 'status resolvido'
    if (status === 'Em andamento') return 'status andamento'
    if (status === 'Cancelado') return 'status cancelado'
    return 'status aberto'
  }

  const usuariosFiltrados = usuarios.filter(u =>
    u.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
    u.email.toLowerCase().includes(pesquisa.toLowerCase()) ||
    u.perfil.toLowerCase().includes(pesquisa.toLowerCase()) ||
    u.setor.toLowerCase().includes(pesquisa.toLowerCase())
  )

  const chamadosFiltrados = consulta.filter(c =>
    c.titulo.toLowerCase().includes(pesquisa.toLowerCase()) ||
    c.categoria.toLowerCase().includes(pesquisa.toLowerCase()) ||
    c.nivel.toLowerCase().includes(pesquisa.toLowerCase()) ||
    c.status.toLowerCase().includes(pesquisa.toLowerCase()) ||
    c.solicitante?.nome?.toLowerCase().includes(pesquisa.toLowerCase())
  )

  if (!usuarioLogado) {
    return (
      <div className="login-page">
        <form className="login-card" onSubmit={login}>
          <h1>HelpDesk Hospitalar</h1>
          <p>Acesso restrito ao sistema interno de chamados</p>

          <input
            type="email"
            placeholder="E-mail corporativo"
            value={emailLogin}
            onChange={(e) => setEmailLogin(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Senha"
            value={senhaLogin}
            onChange={(e) => setSenhaLogin(e.target.value)}
            required
          />

          {erroLogin && <div className="erro-login">{erroLogin}</div>}

          <button type="submit">Entrar no sistema</button>
        </form>
      </div>
    )
  }

  return (
    <div className="app">
      {toast && (
        <div className="toast">
          <h3>{toast.titulo}</h3>
          <p>{toast.mensagem}</p>
        </div>
      )}

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
        <button className="danger-menu" onClick={logout}>Sair</button>
      </aside>

      <main>
        {tela === 'dashboard' && (
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
        )}

        {tela === 'usuarios' && usuarioLogado.perfil === 'admin' && (
          <section>
            <h2>Cadastro de Usuários</h2>

            <form onSubmit={salvarUsuario}>
              <input placeholder="Nome" value={usuarioForm.nome} onChange={e => setUsuarioForm({ ...usuarioForm, nome: e.target.value })} required />
              <input placeholder="E-mail" value={usuarioForm.email} onChange={e => setUsuarioForm({ ...usuarioForm, email: e.target.value })} required />
              <input placeholder="Senha" value={usuarioForm.senha} onChange={e => setUsuarioForm({ ...usuarioForm, senha: e.target.value })} required />

              <select value={usuarioForm.perfil} onChange={e => setUsuarioForm({ ...usuarioForm, perfil: e.target.value })}>
                <option value="admin">Admin TI</option>
                <option value="tecnico">Técnico TI</option>
                <option value="funcionario">Funcionário</option>
              </select>

              <input
                placeholder="CPF"
                value={usuarioForm.cpf}
                onChange={e => setUsuarioForm({ ...usuarioForm, cpf: formatarCPF(e.target.value) })}
              />

              <input placeholder="Cargo" value={usuarioForm.cargo} onChange={e => setUsuarioForm({ ...usuarioForm, cargo: e.target.value })} required />
              <input placeholder="Setor" value={usuarioForm.setor} onChange={e => setUsuarioForm({ ...usuarioForm, setor: e.target.value })} required />

              <input
                placeholder="Telefone"
                value={usuarioForm.telefone}
                onChange={e => setUsuarioForm({ ...usuarioForm, telefone: formatarTelefone(e.target.value) })}
              />

              <button>{editUsuarioId ? 'Atualizar usuário' : 'Cadastrar usuário'}</button>
            </form>

            <input className="search" placeholder="Pesquisar usuários" value={pesquisa} onChange={e => setPesquisa(e.target.value)} />

            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Cargo</th><th>Setor</th><th>Ações</th>
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
                      <button onClick={() => editarUsuario(u)}>Editar</button>
                      <button className="danger" onClick={() => excluirUsuario(u.id)}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {tela === 'abrir' && usuarioLogado.perfil === 'funcionario' && (
          <section>
            <h2>Abrir Chamado</h2>

            <form onSubmit={abrirChamado}>
              <input placeholder="Título do chamado" value={chamadoForm.titulo} onChange={e => setChamadoForm({ ...chamadoForm, titulo: e.target.value })} required />
              <input placeholder="Descrição do problema" value={chamadoForm.descricao} onChange={e => setChamadoForm({ ...chamadoForm, descricao: e.target.value })} required />

              <select value={chamadoForm.categoria} onChange={e => setChamadoForm({ ...chamadoForm, categoria: e.target.value })}>
                <option>Sistemas</option>
                <option>Infraestrutura</option>
                <option>Impressora</option>
                <option>Rede</option>
                <option>Hardware</option>
                <option>Acesso/Login</option>
                <option>Outro</option>
              </select>

              <select value={chamadoForm.nivel} onChange={e => setChamadoForm({ ...chamadoForm, nivel: e.target.value })}>
                <option>Baixo</option>
                <option>Médio</option>
                <option>Alto</option>
                <option>Crítico</option>
              </select>

              <button>Abrir chamado</button>
            </form>
          </section>
        )}

        {tela === 'chamados' && (
          <section>
            <h2>{usuarioLogado.perfil === 'funcionario' ? 'Meus Chamados' : 'Chamados Solicitados'}</h2>

            <input className="search" placeholder="Pesquisar chamados" value={pesquisa} onChange={e => setPesquisa(e.target.value)} />

            <table>
              <thead>
                <tr>
                  <th>Protocolo</th><th>Título</th><th>Solicitante</th><th>Categoria</th><th>Nível</th><th>Status</th><th>Responsável</th><th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {chamadosFiltrados.map(c => (
                  <tr key={c.id}>
                    <td>{protocolo(c.id)}</td>
                    <td>{c.titulo}</td>
                    <td>{c.solicitante?.nome}</td>
                    <td>{c.categoria}</td>
                    <td>{c.nivel}</td>
                    <td><span className={classeStatus(c.status)}>{c.status}</span></td>
                    <td>{c.tecnico?.nome || 'Não assumido'}</td>
                    <td>
                      <button onClick={() => setChamadoSelecionado(c)}>Detalhes</button>

                      {(usuarioLogado.perfil === 'tecnico' || usuarioLogado.perfil === 'admin') && c.status !== 'Resolvido' && (
                        <>
                          {c.tecnico_id === usuarioLogado.id ? (
                            <span className="status andamento">Assumido por você</span>
                          ) : (
                            <button onClick={() => assumirChamado(c.id)}>
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
        )}

        {tela === 'consultas' && (
          <section>
            <h2>Consulta com INNER JOIN</h2>
            <p>Chamados relacionados aos usuários solicitantes e técnicos responsáveis.</p>

            <table>
              <thead>
                <tr>
                  <th>Protocolo</th><th>Título</th><th>Status</th><th>Funcionário</th><th>Cargo</th><th>Setor</th><th>Técnico</th><th>Resposta TI</th>
                </tr>
              </thead>
              <tbody>
                {chamadosFiltrados.map(c => (
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
        )}

        {chamadoSelecionado && (
          <div className="modal">
            <div className="modal-content">
              <h2>{protocolo(chamadoSelecionado.id)}</h2>

              <p><strong>Título:</strong> {chamadoSelecionado.titulo}</p>
              <p><strong>Descrição:</strong> {chamadoSelecionado.descricao}</p>
              <p><strong>Solicitante:</strong> {chamadoSelecionado.solicitante?.nome}</p>
              <p><strong>Categoria:</strong> {chamadoSelecionado.categoria}</p>
              <p><strong>Nível:</strong> {chamadoSelecionado.nivel}</p>
              <p><strong>Status:</strong> {chamadoSelecionado.status}</p>
              <p><strong>Técnico responsável:</strong> {chamadoSelecionado.tecnico?.nome || 'Não assumido'}</p>
              <p><strong>Resposta da TI:</strong> {chamadoSelecionado.resposta_ti || 'Ainda sem resposta.'}</p>

              {(usuarioLogado.perfil === 'tecnico' || usuarioLogado.perfil === 'admin') && chamadoSelecionado.status !== 'Resolvido' && chamadoSelecionado.tecnico_id !== usuarioLogado.id && (
                <p><strong>Ação necessária:</strong> assuma este chamado antes de resolvê-lo.</p>
              )}

              {(usuarioLogado.perfil === 'tecnico' || usuarioLogado.perfil === 'admin') && chamadoSelecionado.status !== 'Resolvido' && chamadoSelecionado.tecnico_id === usuarioLogado.id && (
                <>
                  <textarea
                    placeholder="Descreva a solução aplicada pela TI"
                    value={respostaForm}
                    onChange={(e) => setRespostaForm(e.target.value)}
                  />

                  <button onClick={() => resolverChamado(chamadoSelecionado.id)}>
                    Resolver chamado
                  </button>
                </>
              )}

              <button onClick={() => setChamadoSelecionado(null)}>Fechar</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App