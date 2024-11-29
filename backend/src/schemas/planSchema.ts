import * as Yup from 'yup'
import prisma from '../prisma/client'

export const planSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'ERR_PLAN_INVALID_NAME')
    .required('ERR_PLAN_INVALID_NAME')
    .test('Check-unique-name', 'ERR_PLAN_NAME_ALREADY_EXISTS', async value => {
      if (value) {
        const planWithSameName = await prisma.plan.findFirst({
          where: { name: value },
        })

        return !planWithSameName
      }
      return false
    }),
  users: Yup.number().required('ERR_PLAN_INVALID_USERS'),
  connections: Yup.number().required('ERR_PLAN_INVALID_CONNECTIONS'),
  queues: Yup.number().required('ERR_PLAN_INVALID_QUEUES'),
  value: Yup.number().required('ERR_PLAN_INVALID_VALUE'),
})
