export interface WhatsappData {
    name: string;
    queueIds: number[];
    companyId: number;
    greetingMessage?: string;
    complationMessage?: string;
    outOfHoursMessage?: string;
    ratingMessage?: string;
    status?: string;
    isDefault?: boolean;
    token?: string;
    //sendIdQueue?: number;
    //timeSendQueue?: number;
    transferQueueId?: number;
    timeToTransfer?: number;  
    promptId?: number;
    maxUseBotQueues?: number;
    timeUseBotQueues?: number;
    expiresTicket?: number;
    expiresInactiveMessage?: string;
}

export interface QueryParams {
  session?: number | string
}