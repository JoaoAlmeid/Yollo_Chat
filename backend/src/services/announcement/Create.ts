import { Announcement } from '@prisma/client'
import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'
import validateAnnouncementSchema from './validation'

interface Data {
  priority: number
  title: string
  text: string
  status: boolean
  companyId: number
}

const CreateService = async (data: Data): Promise<Announcement> => {
  validateAnnouncementSchema(data)
  try {
    const record = await prisma.announcement.create({
      data: {
        priority: data.priority,
        title: data.title,
        text: data.text,
        status: data.status,
        companyId: data.companyId
      }
    })

    return record
  } catch (error: any) {
    console.error(`Erro ao criar anúncio: ${error.message}`)
    throw new AppError(`Erro interno ao criar anúncio: ${error.message}`, 500)
  }
}

export default CreateService