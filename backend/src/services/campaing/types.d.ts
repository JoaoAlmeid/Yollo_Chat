export interface DataCampaing {
  id?: number | string
  name: string
  status: string
  confirmation: boolean
  scheduledAt: string
  companyId: number
  whatsappId: number
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
  fileListId: number
  mediaPath?: string
  mediaName?: string
}

export interface ListRequest {
  companyId: number | string
  searchParam?: string
  pageNumber?: string
}

export interface ListResponse {
  records: Campaign[]
  count: number
  hasMore: boolean
}