import * as Yup from 'yup'
import { Schedule } from '@prisma/client'
import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'
import { RequestSchedule } from '../../@types/Schedule'
import { createScheduleSchema } from '../../schemas/scheduleSchema'

const CreateSchedule = async ({
  body,
  sendAt,
  contactId,
  companyId,
  userId,
}: RequestSchedule): Promise<Schedule> => {
  try {
    await createScheduleSchema.validate({ body, sendAt })
  } catch (err: any) {
    throw new AppError(err.message)
  }

  const data: any = {
    body,
    sendAt,
    contactId: typeof contactId === 'string' ? parseInt(contactId) : contactId,
    companyId: typeof companyId === 'string' ? parseInt(companyId) : companyId,
    status: 'PENDENTE',
  }

  if (userId) {
    data.userId = typeof userId === 'string' ? parseInt(userId) : userId
  }

  const schedule = await prisma.schedule.create({ data })
  return schedule
}

export default CreateSchedule
