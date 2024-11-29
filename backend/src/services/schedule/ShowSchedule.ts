import { Schedule } from '@prisma/client'
import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'

const ShowSchedule = async (
  id: string | number,
  companyId: number
): Promise<Schedule> => {
  const scheduleId = typeof id === 'string' ? parseInt(id) : id

  const schedule = await prisma.schedule.findUnique({
    where: {
      id: scheduleId,
    },
    include: {
      contact: {
        select: {
          id: true,
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!schedule) {
    throw new AppError('ERR_NO_SCHEDULE_FOUND', 404)
  }

  if (schedule.companyId !== companyId) {
    throw new AppError('Não é possível acessar o registro de outra empresa')
  }

  return schedule
}

export default ShowSchedule
