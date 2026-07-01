import { formatarCPF, formatarTelefone } from '../utils/formatters'

export default function ModalUsuario({ 
  aberto, 
  modo, 
  usuarioForm, 
  setUsuarioForm, 
  onSalvar, 
  onFechar 
}) {
  if (!aberto) return null

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{modo === 'criar' ? 'Novo usuário' : 'Editar usuário'}</h2>

        <form onSubmit={onSalvar}>
          <input
            placeholder="Nome"
            value={usuarioForm.nome}
            onChange={e => setUsuarioForm({ ...usuarioForm, nome: e.target.value })}
            required
          />

          <input
            placeholder="E-mail"
            value={usuarioForm.email}
            onChange={e => setUsuarioForm({ ...usuarioForm, email: e.target.value })}
            required
          />

          <input
            placeholder="Senha"
            value={usuarioForm.senha}
            onChange={e => setUsuarioForm({ ...usuarioForm, senha: e.target.value })}
            required
          />

          <select
            value={usuarioForm.perfil}
            onChange={e => setUsuarioForm({ ...usuarioForm, perfil: e.target.value })}
          >
            <option value="admin">Admin TI</option>
            <option value="tecnico">Técnico TI</option>
            <option value="funcionario">Funcionário</option>
          </select>

          <input
            placeholder="CPF"
            value={usuarioForm.cpf}
            onChange={e => setUsuarioForm({ ...usuarioForm, cpf: formatarCPF(e.target.value) })}
          />

          <input
            placeholder="Cargo"
            value={usuarioForm.cargo}
            onChange={e => setUsuarioForm({ ...usuarioForm, cargo: e.target.value })}
            required
          />

          <input
            placeholder="Setor"
            value={usuarioForm.setor}
            onChange={e => setUsuarioForm({ ...usuarioForm, setor: e.target.value })}
            required
          />

          <input
            placeholder="Telefone"
            value={usuarioForm.telefone}
            onChange={e => setUsuarioForm({ ...usuarioForm, telefone: formatarTelefone(e.target.value) })}
          />

          <button type="submit">
            {modo === 'criar' ? 'Cadastrar usuário' : 'Salvar alterações'}
          </button>
        </form>

        <button onClick={onFechar}>Cancelar</button>
      </div>
    </div>
  )
}
