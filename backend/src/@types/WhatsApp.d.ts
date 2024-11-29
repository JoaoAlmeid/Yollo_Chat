import { Whatsapp } from '@prisma/client'

export interface RequestWhatsApp {
  name: string
  companyId: number
  queueIds?: number[]
  greetingMessage?: string
  complationMessage?: string
  outOfHoursMessage?: string
  ratingMessage?: string
  status?: string
  isDefault?: boolean
  token?: string
  provider?: string
  // sendIdQueue?: number
  // timeSendQueue?: number
  transferQueueId?: number
  timeToTransfer?: number    
  promptId?: number
  maxUseBotQueues?: number
  timeUseBotQueues?: number
  expiresTicket?: number
  expiresInactiveMessage?: string
}

export interface ResponseWhatsApp {
  whatsapp: any
  oldDefaultWhatsapp: Whatsapp | null
}

export interface RequestListWhatsApp {
  companyId: number
  session?: number | string
}

export interface ShowWhatsAppServiceRequest {
  id: number
  companyId: number
  session?: any
}

export interface WhatsappWithQueues extends Whatsapp {
  queues?: {
    id: number
    name: string
    color: string
    greetingMessage: string | null
    options: {
      id: number
      title: string
      message: string | null
      option: string | null
    }[]
  }[]
  schedules?: any[]
}

interface WhatsappData {
  name?: string
  status?: string
  session?: string
  isDefault?: boolean
  greetingMessage?: string
  complationMessage?: string
  outOfHoursMessage?: string
  ratingMessage?: string
  queueIds?: number[]
  token?: string
  sendIdQueue?: number | null
  timeSendQueue?: number
}

export interface RequestUpWhatsApp {
  whatsappData: WhatsappData
  whatsappId: number
  companyId: number
}
