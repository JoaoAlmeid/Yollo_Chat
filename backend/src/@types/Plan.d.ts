export interface PlanData {
  name: string;
  id?: number | string;
  users?: number;
  connections?: number;
  queues?: number;
  value?: number;
  useCampaigns?: boolean;
  useSchedules?: boolean;
  useInternalChat?: boolean;
  useExternalApi?: boolean;
  useKanban?: boolean;
  useOpenAi?: boolean;
  useIntegrations?: boolean
}

export interface RequestPlan {
  searchParam?: string
  pageNumber?: string
}

export interface ResponsePlan {
  plans: Plan[]
  count: number
  hasMore: boolean
}
