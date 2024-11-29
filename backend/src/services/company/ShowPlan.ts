import { Company } from "@prisma/client";
import AppError from "src/errors/AppError";
import prisma from "../../prisma/client";

const ShowPlanCompanyService = async (id: string | number): Promise<Company | null> => {
    try {
        const company = await prisma.company.findUnique({
            where: { id: Number(id) },
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
                    schedules: true,
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
            }
        });
    
        if (!company) {
            throw new AppError("Empresa não encontrada", 404)
        }

        return company;
    } catch (error: any) {
        console.error(`Erro ao exibir empresa ${error.message}`)
        throw new AppError(`Erro interno ao exibir empresa ${error.message}`, 500)
    }
};

export default ShowPlanCompanyService;
