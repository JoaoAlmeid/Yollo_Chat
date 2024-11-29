import AppError from 'src/errors/AppError'
import * as Yup from 'yup'

interface Data {
    type?: string
    name?: string
    projectName?: string
    jsonContent?: string
    language?: string
    urlN8N?: string
}

const validateQueueIntegration = async (data: Data) => {
    const schema = Yup.object().shape({
        type: Yup.string().min(2),
        name: Yup.string().min(2)
    })

    try {
      await schema.validate(data)
    } catch (err) {
      throw new AppError(err.message)
    }
}

export default validateQueueIntegration