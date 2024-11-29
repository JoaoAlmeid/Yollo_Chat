import * as Yup from 'yup'
import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'
import ShowScheduleService from './ShowSchedule'
import { Schedule } from '@prisma/client'
import { RequestUpSchedule } from '../../@types/Schedule'

const UpdateSchedule = async ({
  scheduleData,
  id,
  companyId,
}: RequestUpSchedule): Promise<Schedule | null> => {
  const schedule = await ShowScheduleService(id, companyId)

  if (!schedule) {
    throw new AppError('ERR_NO_SCHEDULE_FOUND', 404)
  }

  if (schedule.companyId !== companyId) {
    throw new AppError('Não é possível alterar registros de outra empresa')
  }

  const schema = Yup.object().shape({
    body: Yup.string().min(5),
  })

  const { body, sendAt, sentAt, contactId, ticketId, userId } = scheduleData

  try {
    await schema.validate({ body })
  } catch (err: any) {
    throw new AppError(err.message)
  }

  const updatedSchedule = await prisma.schedule.update({
    where: {
      id: typeof id === 'string' ? parseInt(id) : id,
    },
    data: {
      body,
      sendAt,
      sentAt,
      contactId,
      ticketId,
      userId,
    },
  })

  return updatedSchedule
}

export default UpdateSchedule
