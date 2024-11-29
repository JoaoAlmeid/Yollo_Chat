import { proto, downloadMediaMessage } from '@whiskeysockets/baileys'

const downloadMedia = async (msg: proto.IWebMessageInfo) => {
  let buffer
  try {
    buffer = await downloadMediaMessage(msg, 'buffer', {})
  } catch (err) {
    console.error('Erro ao baixar mídia:', err)
    return null
  }

  // Obter o nome do arquivo
  let filename = msg.message?.documentMessage?.fileName || ''

  // Determina o tipo de mídia da mensagem
  const mimeType =
    msg.message?.imageMessage ||
    msg.message?.audioMessage ||
    msg.message?.videoMessage ||
    msg.message?.stickerMessage ||
    msg.message?.documentMessage ||
    msg.message?.documentWithCaptionMessage?.message?.documentMessage ||
    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage

  // Se o mimeType não puder ser determinado ou não tiver um mimeType
  if (!mimeType?.mimetype) {
    console.log(msg)
    return null
  }

  // Determina a extensão do arquivo
  if (!filename) {
    const ext = mimeType.mimetype.split('/')[1]
    filename = `${new Date().getTime()}.${ext}`
  } else {
    filename = `${new Date().getTime()}_${filename}`
  }

  // Cria o objeto de media contendo os dados, mimetype e nome do arquivo
  const media = {
    data: buffer,
    mimetype: mimeType.mimetype,
    filename,
  }

  return media
}

export default downloadMedia