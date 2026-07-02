import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { formatarCPF, formatarTelefone, protocolo } from './utils/formatters'
import './App.css'

// Componentes
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Usuarios from './components/Usuarios'
import ModalUsuario from './components/ModalUsuario'
import Chamados from './components/Chamados'
import ModalChamado from './components/ModalChamado'
import Consultas from './components/Consultas'
import Toast from './components/Toast'

function App() {
  // Estado de autenticação
  const [usuarioLogado, setUsuarioLogado] = useState(null)
  const [emailLogin, setEmailLogin] = useState('')
  const [senhaLogin, setSenhaLogin] = useState('')
  const [erroLogin, setErroLogin] = useState('')

  // Estado de tela
  const [tela, setTela] = useState('dashboard')

  // Estado de dados
  const [usuarios, setUsuarios] = useState([])
  const [chamados, setChamados] = useState([])
  const [consulta, setConsulta] = useState([])
  const [categorias, setCategorias] = useState([])

  // Estado de modal de usuário
  const [modalUsuarioAberto, setModalUsuarioAberto] = useState(false)
  const [modoUsuario, setModoUsuario] = useState('criar')
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
  const [editUsuarioId, setEditUsuarioId] = useState(null)

  // Estado de chamado
  const [chamadoForm, setChamadoForm] = useState({
    titulo: '',
    descricao: '',
    categoria_id: '',
    nivel: 'Médio'
  })
  const [respostaForm, setRespostaForm] = useState('')
  const [chamadoSelecionado, setChamadoSelecionado] = useState(null)

  // Estado de pesquisa
  const [pesquisaUsuarios, setPesquisaUsuarios] = useState('')
  const [pesquisaChamados, setPesquisaChamados] = useState('')
  const [pesquisaConsultas, setPesquisaConsultas] = useState('')

  // Estado de toast
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
    await carregarCategorias()
    await carregarChamados()
    await carregarConsulta()
  }

  async function carregarUsuarios() {
    const { data } = await supabase.from('usuarios').select('*').order('id')
    setUsuarios(data || [])
  }
  async function carregarCategorias() {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nome')
    if (error) {
      console.error('Erro ao carregar categorias:', error)
      alert('Erro ao carregar categorias.')
      return
    }
    console.log('Categorias carregadas:', data)
    setCategorias(data || [])
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
      ),
      categoria_dados:categorias!fk_categoria (
        nome,
        descricao
      )
    `)
    .order('id')

   if (usuarioLogado.perfil === 'funcionario') {
    query = query.eq('solicitante_id', usuarioLogado.id)
  }

  const { data } = await query
  setConsulta(data || [])
}

  function abrirModalNovoUsuario() {
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

    setEditUsuarioId(null)
    setModoUsuario('criar')
    setModalUsuarioAberto(true)
  }

  function abrirModalEditarUsuario(u) {
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
    setModoUsuario('editar')
    setModalUsuarioAberto(true)
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

    setModalUsuarioAberto(false)
    carregarTudo()
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

  const categoriaSelecionada = categorias.find(
    cat => String(cat.id) === String(chamadoForm.categoria_id)
  )

  if (!categoriaSelecionada) {
    alert('Selecione uma categoria.')
    return false
  }

  const { data, error } = await supabase
    .from('chamados')
    .insert([{
      titulo: chamadoForm.titulo,
      descricao: chamadoForm.descricao,
      categoria: categoriaSelecionada.nome,
      categoria_id: Number(chamadoForm.categoria_id),
      nivel: chamadoForm.nivel,
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
    return false
  }

  setChamadoForm({
    titulo: '',
    descricao: '',
    categoria_id: '',
    nivel: 'Médio'
  })

  mostrarToast(
    'Chamado criado',
    `${protocolo(data.id)} registrado com sucesso. Acompanhe em Meus chamados.`
  )

  carregarTudo()
  return true
}

  async function assumirChamado(id) {
    await supabase
      .from('chamados')
      .update({
        status: 'Em andamento',
        tecnico_id: usuarioLogado.id
      })
      .eq('id', id)

    setChamadoSelecionado(null)
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

  if (!usuarioLogado) {
    return (
      <Login 
        emailLogin={emailLogin}
        setEmailLogin={setEmailLogin}
        senhaLogin={senhaLogin}
        setSenhaLogin={setSenhaLogin}
        erroLogin={erroLogin}
        onLogin={login}
      />
    )
  }

  return (
    <div className="app">
      <Toast titulo={toast?.titulo} mensagem={toast?.mensagem} />

      <Sidebar 
        usuarioLogado={usuarioLogado}
        tela={tela}
        setTela={setTela}
        onLogout={logout}
      />

      <main>
        {tela === 'dashboard' && (
          <Dashboard chamados={chamados} />
        )}

        {tela === 'usuarios' && usuarioLogado.perfil === 'admin' && (
          <Usuarios
            usuarios={usuarios}
            pesquisa={pesquisaUsuarios}
            setPesquisa={setPesquisaUsuarios}
            onNovoUsuario={abrirModalNovoUsuario}
            onEditar={abrirModalEditarUsuario}
            onExcluir={excluirUsuario}
          />
        )}

        {tela === 'chamados' && (
          <Chamados
            usuarioLogado={usuarioLogado}
            consulta={consulta}
            pesquisa={pesquisaChamados}
            setPesquisa={setPesquisaChamados}
            chamadoForm={chamadoForm}
            setChamadoForm={setChamadoForm}
            categorias={categorias}
            onAbrirChamado={abrirChamado}
            onDetalhes={setChamadoSelecionado}
            onAssumir={assumirChamado}
          />
        )}

        {tela === 'consultas' && (
          <Consultas
            usuarioLogado={usuarioLogado}
            usuarios={usuarios}
            consulta={consulta}
            categorias={categorias}
            pesquisa={pesquisaConsultas}
            setPesquisa={setPesquisaConsultas}
          />
        )}

        <ModalUsuario
          aberto={modalUsuarioAberto}
          modo={modoUsuario}
          usuarioForm={usuarioForm}
          setUsuarioForm={setUsuarioForm}
          onSalvar={salvarUsuario}
          onFechar={() => setModalUsuarioAberto(false)}
        />

        <ModalChamado
          chamadoSelecionado={chamadoSelecionado}
          usuarioLogado={usuarioLogado}
          respostaForm={respostaForm}
          setRespostaForm={setRespostaForm}
          onAssumir={assumirChamado}
          onResolver={resolverChamado}
          onFechar={() => setChamadoSelecionado(null)}
        />
      </main>
    </div>
  )
}

export default App
