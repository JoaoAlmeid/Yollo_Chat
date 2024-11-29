import * as Yup from 'yup'

export const quickMessageSchema = Yup.object().shape({
  shortcode: Yup.string()
    .min(3, 'ERR_QUICKMESSAGE_INVALID_SHORTCODE')
    .required('ERR_QUICKMESSAGE_REQUIRED'),
  message: Yup.string()
    .min(3, 'ERR_QUICKMESSAGE_INVALID_MESSAGE')
    .required('ERR_QUICKMESSAGE_REQUIRED'),
})
