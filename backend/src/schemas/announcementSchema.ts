import * as Yup from 'yup'

export const createSchema = Yup.object().shape({
    title: Yup.string().required('ERR_ANNOUNCEMENT_REQUIRED'),
    text: Yup.string().required('ERR_ANNOUNCEMENT_REQUIRED'),
})