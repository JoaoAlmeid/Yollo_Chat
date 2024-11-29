import AppError from "../../errors/AppError"
import { Company } from "@prisma/client"
import prisma from "../../prisma/client"
import { ScheduleData } from "./types"

const UpdateSchedulesService = async ({ id, schedules }: ScheduleData): Promise<Company> => {
    try {
        const company = await prisma.company.findUnique({ 
            where: { id: Number(id) } 
        })
        
        if (!company) {
          throw new AppError("Erro: Empresa não encontrada", 404)
        }

        const updatedCompany = await prisma.company.update({
            where: { id: company.id},
            data: {
                schedules: {
                    set: schedules.map(schedule => ({
                        id: schedule.id
                    }))
                }
            }
        })

        return updatedCompany
    } catch (error: any) {
        console.error(`Erro ao atualizar horários da empresa: ${error.message}`)
        throw new AppError(`Erro interno ao atualizar horários da empresa: ${error.message}`, 500)
    }
}

export default UpdateSchedulesService