export function getAndCleanCpfCnpj(msg: any): string | null {
  let cpfCnpj = msg.split('CPF: ')[1] || msg.split('CNPJ: ')[1] || ''
  cpfCnpj = cpfCnpj.replace(/[^0-9]/g, '')
  return cpfCnpj
}
