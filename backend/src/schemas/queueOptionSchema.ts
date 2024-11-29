import * as Yup from 'yup'

export const createQueueOptionSchema = Yup.object().shape({
  queueId: Yup.string().required('Queue ID is required'),
  title: Yup.string().required('Title is required'),
  option: Yup.string().required('Option is required'),
  message: Yup.string(),
  parentId: Yup.string(),
})
