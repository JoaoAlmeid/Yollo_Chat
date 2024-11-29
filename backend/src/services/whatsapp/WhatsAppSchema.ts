import * as Yup from 'yup'
import prisma from '../../prisma/client'

export const updatedSchema = Yup.object().shape({
    name: Yup.string().min(2),
    status: Yup.string(),
    isDefault: Yup.boolean(),
})
export const createdSchema = Yup.object().shape({
    name: Yup.string().required('Nome é obrigatório'),
    status: Yup.string().required('Status é obrigatório'),
    isDefault: Yup.boolean(),
    token: Yup.string()
      .nullable()
      .test('Check-token', 'Este token do WhatsApp já está sendo usado.', async (value) => {
        if (!value) return true
        const tokenExists = await prisma.whatsapp.findFirst({
          where: { token: value },
        })
        return !tokenExists
      })
})
