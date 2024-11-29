import * as Yup from 'yup'

export const createScheduleSchema = Yup.object().shape({
  body: Yup.string().required().min(5),
  sendAt: Yup.string().required(),
})
