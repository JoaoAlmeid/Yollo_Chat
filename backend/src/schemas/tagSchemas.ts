import * as Yup from 'yup'

export const createTagSchema = Yup.object().shape({
  name: Yup.string().required().min(3),
  color: Yup.string().optional(),
  kanban: Yup.number().optional(),
  companyId: Yup.number().required(),
})

export const updateTagSchema = Yup.object().shape({
  name: Yup.string().min(3).optional(),
  color: Yup.string().optional(),
  kanban: Yup.number().optional(),
})

export const syncTagsSchema = Yup.object().shape({
  tags: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.number().required(),
      })
    )
    .required(),
  ticketId: Yup.number().required(),
})
