import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'

const DeleteSchedule = async (
  id: string | number,
  companyId: number
): Promise<void> => {
  const scheduleId = typeof id === 'string' ? parseInt(id) : id

  const schedule = await prisma.schedule.findFirst({
    where: { id: scheduleId, companyId: companyId },
  })

  if (!schedule) {
    throw new AppError('ERR_NO_SCHEDULE_FOUND', 404)
  }

  await prisma.schedule.delete({ where: { id: scheduleId } })
}

export default DeleteSchedule
