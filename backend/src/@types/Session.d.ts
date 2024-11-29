import {
  ExistsResponse,
  RegistrationOptions,
} from '@whiskeysockets/baileys/lib/Socket/registration'
import { WASocket } from '@whiskeysockets/baileys'
import { Store } from '@adiwajshing/baileys'

// Definição ajustada para compatibilidade com WASocket
export type Session = WASocket & {
  id?: number
  store?: Store
  user?: {
    id: string
    name: string
    number: string
    email: string
    profilePicUrl: string
    isGroup: boolean
    createdAt: Date
    updatedAt: Date
    companyId?: number
  }
  register: (code: string) => Promise<void>
  requestRegistrationCode?: (
    registrationOptions?: RegistrationOptions
  ) => Promise<void>
}
