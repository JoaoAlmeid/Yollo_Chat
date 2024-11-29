export interface ProcessCampaignData {
  id: number
  delay: number
}

export interface PrepareContactData {
  contactId: number
  campaignId: number
  delay: number
  variables: any[]
}

export interface DispatchCampaignData {
  campaignId: number
  campaignShippingId: number
  contactListItemId: number
}

export interface QueueData {
  name: string
  color: string
  companyId: number
  greetingMessage?: string
  outOfHoursMessage?: string
  schedules?: any[]
  orderQueue?: number
  integrationId?: number
  promptId?: number
}

export interface QueueOptionData {
  queueId?: number
  title: string
  option: string
  message?: string
  parentId?: string
}

export interface QueueOptionFilter {
  queueId?: number
  queueOptionId?: number
  parentId?: number
}

export interface QueueUpData {
  queueId?: number
  title?: string
  option?: string
  message?: string
  parentId?: string
}

export interface IntegrationData {
  type?: string
  name?: string
  projectName?: string
  jsonContent?: string
  language?: string
  urlN8N?: string
  companyId?: number
  typebotSlug?: string
  typebotExpires?: number
  typebotKeywordFinish?: string
  typebotUnknownMessage?: string
  typebotDelayMessage?: number
  typebotKeywordRestart?: string
  typebotRestartMessage?: string
}

export interface RequestIntegrations {
  integrationData: IntegrationData
  integrationId?: string
  companyId?: number
}