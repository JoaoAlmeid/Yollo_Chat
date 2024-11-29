import { Company } from "@prisma/client"
import AppError from "src/errors/AppError"
import prisma from "../../prisma/client"

const ListCompaniesPlanService = async (): Promise<Company[]> => {
    try {
        const companies = await prisma.company.findMany({
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                status: true,
                dueDate: true,
                createdAt: true,
                updatedAt: true,
                recurrence: true,
                planId: true,
                plan: {
                    select: {
                        id: true,
                        name: true,
                        users: true,
                        connections: true,
                        queues: true,
                        value: true,
                        useCampaigns: true,
                        useSchedules: true,
                        useInternalChat: true,
                        useExternalApi: true,
                        useKanban: true,
                        useOpenAi: true,
                        useIntegrations: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        })

        return companies
    } catch (error: any) {
        console.error(`Erro ao listar os planos da empresa ${error.message}`)
        throw new AppError(`Erro interno ao listar os planos da empresa ${error.message}`, 500)
    }
}

export default ListCompaniesPlanService