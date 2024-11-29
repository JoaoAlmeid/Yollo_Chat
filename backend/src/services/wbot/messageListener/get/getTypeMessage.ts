import { proto, getContentType } from '@whiskeysockets/baileys'

const getTypeMessage = (msg: proto.IWebMessageInfo): string => {
  if (msg.message && msg.message !== null) {
    const contentType = getContentType(msg.message)

    if (contentType !== undefined) {
      return contentType
    }
  }

  return ''
}

export default getTypeMessage