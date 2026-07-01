export function formatarCPF(valor) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function formatarTelefone(valor) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

export function protocolo(id) {
  return `HD-${new Date().getFullYear()}-${String(id).padStart(4, '0')}`
}

export function classeStatus(status) {
  if (status === 'Resolvido') return 'status resolvido'
  if (status === 'Em andamento') return 'status andamento'
  if (status === 'Cancelado') return 'status cancelado'
  return 'status aberto'
}
