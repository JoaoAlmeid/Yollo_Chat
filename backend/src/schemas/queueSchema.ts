import * as Yup from 'yup'
import prisma from '../prisma/client'

export const queueSchema = (companyId: number, queueId?: number) =>
  Yup.object().shape({
    name: Yup.string()
      .min(2, 'ERR_QUEUE_INVALID_NAME')
      .required('ERR_QUEUE_INVALID_NAME')
      .test(
        'Check-unique-name',
        'ERR_QUEUE_NAME_ALREADY_EXISTS',
        async value => {
          if (value) {
            const existingQueue = await prisma.queue.findFirst({
              where: {
                name: value,
                companyId,
                id: { not: queueId ? Number(queueId) : undefined },
              },
            })
            return !existingQueue
          }
          return true
        }
      ),
    color: Yup.string()
      .required('ERR_QUEUE_INVALID_COLOR')
      .matches(/^#[0-9a-f]{3,6}$/i, 'ERR_QUEUE_INVALID_COLOR')
      .test(
        'Check-color-exists',
        'ERR_QUEUE_COLOR_ALREADY_EXISTS',
        async value => {
          if (value) {
            const existingQueue = await prisma.queue.findFirst({
              where: {
                color: value,
                companyId,
                id: { not: queueId ? Number(queueId) : undefined },
              },
            })
            return !existingQueue
          }
          return true
        }
      ),
  })
