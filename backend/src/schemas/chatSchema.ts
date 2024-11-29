import * as Yup from 'yup'

export const createChatSchema = Yup.object().shape({
  companyId: Yup.number().required(),
  userId: Yup.number().required(),
  title: Yup.string().required(),
  users: Yup.array()
    .of(
      Yup.object().shape({
        userId: Yup.number().required(),
        unreads: Yup.number().optional(),
      })
    )
    .required(),
  usersId: Yup.number().optional(),
  messagesId: Yup.number().optional(),
})
