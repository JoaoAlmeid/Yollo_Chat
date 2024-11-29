import { Plan } from '@prisma/client'
import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'
import { PlanData } from './types'
import validatePlan from './validation'

const CreatePlan = async (planData: PlanData): Promise<Plan> => {
  try {
    validatePlan(planData)
    const plan = await prisma.plan.create({
      data: {
        ...planData,
        useSchedules: planData.useSchedules ?? false,
        useCampaigns: planData.useCampaigns ?? false,
        useInternalChat: planData.useInternalChat ?? false,
        useExternalApi: planData.useExternalApi ?? false,
        useKanban: planData.useKanban ?? false,
        useOpenAi: planData.useOpenAi ?? false,
        useIntegrations: planData.useIntegrations ?? false,  
      },
    })

    return plan
  } catch (error: any) {
    console.error(`Erro ao criar plano: ${error.message}`)
    throw new AppError(`Erro interno ao criar plano: ${error.message}`, 500)
  }
}

export default CreatePlan
