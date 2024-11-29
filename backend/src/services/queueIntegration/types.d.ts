export interface IntegrationData {
  type?: string;
  name?: string;
  projectName?: string;
  jsonContent?: string;
  language?: string;
  urlN8N?: string;
  typebotSlug?: string;
  typebotExpires?: number;
  typebotKeywordFinish?: string;
  typebotUnknownMessage?: string;
  typebotDelayMessage?: number;
  typebotKeywordRestart?: string;
  typebotRestartMessage?: string;
}

export interface RequestU {
  integrationData: IntegrationData;
  integrationId: string;
  companyId: number;
}