import { protocolo, classeStatus } from '../utils/formatters'

export default function ModalChamado({ 
  chamadoSelecionado,
  usuarioLogado,
  respostaForm,
  setRespostaForm,
  onAssumir,
  onResolver,
  onFechar
}) {
  if (!chamadoSelecionado) return null

  const podeResolver = 
    (usuarioLogado.perfil === 'tecnico' || usuarioLogado.perfil === 'admin') &&
    chamadoSelecionado.status !== 'Resolvido' &&
    chamadoSelecionado.tecnico_id === usuarioLogado.id

  const precisaAssumir = 
    (usuarioLogado.perfil === 'tecnico' || usuarioLogado.perfil === 'admin') &&
    chamadoSelecionado.status !== 'Resolvido' &&
    chamadoSelecionado.tecnico_id !== usuarioLogado.id

  return (
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

        {precisaAssumir && (
          <>
            <p><strong>Ação necessária:</strong> assuma este chamado antes de resolvê-lo.</p>
            <button onClick={() => onAssumir(chamadoSelecionado.id)}>
              {chamadoSelecionado.tecnico_id ? 'Assumir para mim' : 'Assumir chamado'}
            </button>
          </>
        )}

        {podeResolver && (
          <>
            <textarea
              placeholder="Descreva a solução aplicada pela TI"
              value={respostaForm}
              onChange={(e) => setRespostaForm(e.target.value)}
            />

            <button onClick={() => onResolver(chamadoSelecionado.id)}>
              Resolver chamado
            </button>
          </>
        )}

        <button onClick={onFechar}>Fechar</button>
      </div>
    </div>
  )
}
