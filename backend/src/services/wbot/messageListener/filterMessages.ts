import { WAMessage, WAMessageStubType } from '@whiskeysockets/baileys'

const filterMessages = (msg: WAMessage): boolean => {
  if (msg.message?.protocolMessage) return false

  const stubTypesToFilter = [
    WAMessageStubType.REVOKE,
    WAMessageStubType.E2E_DEVICE_CHANGED,
    WAMessageStubType.E2E_IDENTITY_CHANGED,
    WAMessageStubType.CIPHERTEXT,
  ]

  if (stubTypesToFilter.includes(msg.messageStubType as WAMessageStubType)) {
    return false
  }

  return true
}

export default filterMessages