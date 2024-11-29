import * as Yup from 'yup'
import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'

const validateCompanySchema = async (data: any) => {
  const companySchema = Yup.object().shape({
    name: Yup.string()
      .min(2, 'Nome muito curto')
      .required('Nome da empresa inválido')
      .test(
        'Check-unique-name',
        'O nome da empresa já existe',
        async value => {
          if (value) {
            const companyWithSameName = await prisma.company.findFirst({
              where: { name: value },
            })
            if (companyWithSameName) {
              throw new AppError(`O nome da empresa (${value}) já existe`, 400)
            }
          }
          return true
        }
      ),
  })

  try {
    await companySchema.validate(data)
  } catch (error: any) {
    throw new AppError(error.message, 400)
  }
}

export default validateCompanySchema