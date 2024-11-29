import * as Yup from 'yup'
import AppError from '../../errors/AppError'

const validateContactListSchema = async (data: any) => {
    const contactListSchema = Yup.object().shape({
        name: Yup.string()
        .min(3, 'Erro: Nome da lista de contatos inválido')
        .required('Erro: Lista de contato é requerida'),
    })
    
    try {
      await contactListSchema.validate({ data })
    } catch (err: any) {
      throw new AppError(err.message, 400)
    }
}

export default validateContactListSchema