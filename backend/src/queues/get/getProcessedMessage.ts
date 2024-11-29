interface Variable {
  key: string
  value: string
}

interface Contact {
  id: number
  name: string
  number: string
  email: string
}

export default function getProcessedMessage(
  msg: string,
  variables: Variable[],
  contact: Contact
): string {
  // Substitui os placeholders fixos pelo conteúdo do contato
  let finalMessage = msg
    .replace(/{nome}/g, contact.name ?? '')
    .replace(/{email}/g, contact.email ?? '')
    .replace(/{numero}/g, contact.number ?? '')

  // Substitui placeholders variáveis pelo valor correspondente
  variables.forEach(variable => {
    const regex = new RegExp(`{${variable.key}}`, 'g')
    finalMessage = finalMessage.replace(regex, variable.value)
  })

  return finalMessage
}
