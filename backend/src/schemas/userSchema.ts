import * as Yup from 'yup'

export const userSchema = Yup.object().shape({
  name: Yup.string().min(2),
  email: Yup.string().email(),
  profile: Yup.string(),
  password: Yup.string(),
})
