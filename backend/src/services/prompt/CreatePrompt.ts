import AppError from "../../errors/AppError"
import { Prompt } from "@prisma/client"
import ShowPromptService from "./ShowPrompt"
import prisma from "../../prisma/client"
import { PromptData } from "src/@types/Prompt"
import promptSchema from "src/schemas/PromptSchema"

const CreatePromptService = async (promptData: PromptData): Promise<Prompt> => {
    const {
        name,
        apiKey,
        prompt,
        queueId,
        maxMessages,
        companyId,
        maxTokens,
        temperature,
        promptTokens,
        completionTokens,
        totalTokens,
        voice,
        voiceKey,
        voiceRegion,
      } = promptData

    try {
        await promptSchema.validate({ 
            name,
            apiKey,
            prompt,
            queueId,
            maxMessages,
            companyId,
        })
    } catch (err) {
        throw new AppError(`${JSON.stringify(err, undefined, 2)}`)
    }

    const promptTable = await prisma.prompt.create({
        data: {
            name,
            apiKey,
            prompt,
            queueId,
            maxMessages,
            companyId: Number(companyId),
            maxTokens,
            temperature,
            promptTokens,
            completionTokens,
            totalTokens,
            voice,
            voiceKey,
            voiceRegion,
          },
    })

    const promptDetails = await ShowPromptService({ promptId: promptTable.id, companyId })

    return promptDetails
}

export default CreatePromptService