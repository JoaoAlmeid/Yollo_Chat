import * as Yup from 'yup'
import prisma from '../prisma/client'

export const companySchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_COMPANY_INVALID_NAME")
      .required("ERR_COMPANY_INVALID_NAME")
      .test(
        "Check-unique-name",
        "ERR_COMPANY_NAME_ALREADY_EXISTS",
        async value => {
          if (value) {
            const companyWithSameName = await prisma.company.findFirst({
              where: { name: value }
            })
            return !companyWithSameName
          }
          return false
        }
      )
})