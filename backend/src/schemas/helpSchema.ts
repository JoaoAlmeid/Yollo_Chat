import * as Yup from 'yup'

export const createHelpSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'ERR_HELP_INVALID_NAME')
    .required('ERR_HELP_REQUIRED'),
  description: Yup.string().min(3, 'ERR_HELP_INVALID_DESCRIPTION').required(),
  video: Yup.string().url('ERR_HELP_INVALID_VIDEO_URL').required(),
  link: Yup.string().url('ERR_HELP_INVALID_LINK_URL').required(),
})
