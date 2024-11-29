import { Campaign, CampaignSetting } from '@prisma/client'

export interface DataType {
  id?: number | string
  name: string
  status: string
  confirmation: boolean
  scheduledAt: string
  companyId: number
  contactListId: number
  message1?: string
  message2?: string
  message3?: string
  message4?: string
  message5?: string
  confirmationMessage1?: string
  confirmationMessage2?: string
  confirmationMessage3?: string
  confirmationMessage4?: string
  confirmationMessage5?: string
}

export interface RequestList {
  companyId: number | string
  searchParam?: string
  pageNumber?: string
}

export interface ResponseList {
  records: Campaign[]
  count: number
  hasMore: boolean
}

export interface UpdateCampaignInput {
  id: number
  name?: string
  message1?: string
  message2?: string
  message3?: string
  message4?: string
  message5?: string
  confirmationMessage1?: string
  confirmationMessage2?: string
  confirmationMessage3?: string
  confirmationMessage4?: string
  confirmationMessage5?: string
  status?: CampaignStatus
  confirmation?: boolean
  mediaPath?: string
  mediaName?: string
  scheduledAt?: string | Date | null | undefined
  companyId?: number
  contactListId?: number
  whatsappId?: number
  shippingId?: number
}

export interface ReqCampaignSetting {
  companyId: number | string
  searchParam?: string
  pageNumber?: string
}

export interface ResCampaignSetting {
  records: CampaignSetting[]
  count: number
  hasMore: boolean
}

export interface CampaignWithContacts extends Campaign {
  contactList: {
    contactListItem: {
      id: number
      name: string
      number: string
      email: string
      isWhatsappValid: boolean
      createdAt: Date
      updatedAt: Date
      contactId: number | null
      companyId: number
      contactListId: number
    }[]
  }
  whatsapp: {
    id: number
    name: string | null
  }
  campaignShipping: {
    contact: {
      id: number
      name: string
      number: string
      email: string
      isWhatsappValid: boolean
    }
  }[]
}

export interface CampaignShipping {
  number: string
  contactId: number
  campaignId: number
  message?: string
  confirmationMessage?: string
  deliveredAt?: Date | null
  confirmationRequestedAt?: Date | null
  jobId?: string
  createdAt: Date
  updatedAt: Date
}
