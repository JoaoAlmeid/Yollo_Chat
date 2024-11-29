import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'
import { CurrentSchedules, Result } from './types'

const VerifyCurrentSchedule = async ( id: number ): Promise<Result | null> => {
  const currentWeekday = new Date().toLocaleDateString('pt-BR', { weekday: 'long' }).toLocaleLowerCase().trim()

  const company = await prisma.company.findUnique({
    where: { id },
    select: {
      id: true,
      schedules: true
    }
  })

  if (!company) {
    throw new AppError('Erro: Empresa não encontrada', 404)
  }

  if (!Array.isArray(company.schedules)) {
    throw new AppError('Erro: Estrutura inválida para o campo de horários', 400)
  }

  // Filtra o horário atual de acordo com o dia da semana
  const currentSchedule = (company.schedules as unknown as CurrentSchedules[]).find((schedule: any) => 
    schedule.weekdayEn.toLocaleLowerCase().trim() === currentWeekday
  )

  if (!currentSchedule || !currentSchedule.startTime || !currentSchedule.endTime) {
    return null
  }

  const now = new Date().toTimeString().split(" ")[0]
  
  const inActivity = now >= currentSchedule.startTime && now <= currentSchedule.endTime

  return {
    id: company.id,
    currentSchedule,
    startTime: currentSchedule.startTime,
    endTime: currentSchedule.endTime,
    inActivity,
  }
}

export default VerifyCurrentSchedule