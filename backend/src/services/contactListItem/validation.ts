import AppError from 'src/errors/AppError'
import * as Yup from 'yup'

const validateListItemSchema = async (data: any) => {
    const createListItem = Yup.object().shape({
        name: Yup.string()
          .min(3, 'ERR_CONTACTLISTITEM_INVALID_NAME')
          .required('ERR_CONTACTLISTITEM_REQUIRED'),
    })

    try {
      await createListItem.validate({ data })
    } catch (err: any) {
      throw new AppError(err.message, 400)
    }
}

export default validateListItemSchema