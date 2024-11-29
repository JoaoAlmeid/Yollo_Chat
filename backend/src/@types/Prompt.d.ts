export interface PromptData {
    id?: number
    name: string
    apiKey: string
    prompt: string
    maxTokens?: number
    temperature?: number
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
    queueId?: number
    maxMessages?: number
    companyId: string | number
    voice?: string
    voiceKey?: string
    voiceRegion?: string
}
export interface RequestListPrompt {
    searchParam?: string
    pageNumber?: string | number
    companyId: string | number
}
export interface ResponseListPrompt {
    prompts: Prompt[]
    count: number
    hasMore: boolean
}

export interface RequestUpPrompt {
    promptData: PromptData;
    promptId: string | number;
    companyId: string | number;
}