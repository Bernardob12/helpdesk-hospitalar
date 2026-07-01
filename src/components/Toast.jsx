export default function Toast({ titulo, mensagem }) {
  if (!titulo) return null

  return (
    <div className="toast">
      <h3>{titulo}</h3>
      <p>{mensagem}</p>
    </div>
  )
}
