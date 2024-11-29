import { jidNormalizedUser } from '@whiskeysockets/baileys'
import { Session } from '../../../../@types/Session'
import { IMe } from '../../../../@types/wbot'

const getMeSocket = (wbot: Session): IMe => {
  if (!wbot.user) {
    throw new Error('Propriedade "user" não encontrada ou é undefined em wbot')
  }

  return {
    id: jidNormalizedUser(wbot.user.id),
    name: wbot.user.name || 'Nome não definido',
  }
}

export default getMeSocket