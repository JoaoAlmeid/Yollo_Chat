export interface PlanData {
  name: string;
  users: number;
  connections: number;
  queues: number;
  value: number;
  useCampaigns?: boolean;
  useSchedules?: boolean;
  useInternalChat?: boolean;
  useExternalApi?: boolean;
  useKanban?: boolean;
  useOpenAi?: boolean;
  useIntegrations?: boolean;
}