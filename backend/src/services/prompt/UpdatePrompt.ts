import AppError from "../../errors/AppError";
import { Prompt } from "@prisma/client";
import prisma from "../../prisma/client";
import ShowPromptService from "./ShowPrompt";
import { RequestUpPrompt } from "src/@types/Prompt";
import promptSchema from "src/schemas/PromptSchema";

const UpdatePromptService = async ({
    promptId,
    promptData,
    companyId
}: RequestUpPrompt): Promise<Prompt | null> => {
    // Verifica se o prompt existe
    const promptTable = await ShowPromptService({ promptId: promptId, companyId });

    const { 
        name, 
        apiKey, 
        prompt, 
        maxTokens, 
        temperature, 
        promptTokens, 
        completionTokens, 
        totalTokens, 
        queueId, 
        maxMessages, 
        voice, 
        voiceKey, 
        voiceRegion } = promptData;

    try {
        await promptSchema.validate({ 
            name, 
            apiKey, 
            prompt, 
            maxTokens, 
            temperature, 
            promptTokens, 
            completionTokens, 
            totalTokens, 
            queueId, 
            maxMessages 
        })
    } catch (err) {
        throw new AppError(`${JSON.stringify(err, undefined, 2)}`);
    }

    // Atualiza o prompt
    const updatedPrompt = await prisma.prompt.update({
        where: {
            id: promptTable.id,
        },
        data: {
            name,
            apiKey,
            prompt,
            maxTokens,
            temperature,
            promptTokens,
            completionTokens,
            totalTokens,
            queueId,
            maxMessages,
            voice,
            voiceKey,
            voiceRegion,
        },
    })

    return updatedPrompt;
};

export default UpdatePromptService;
