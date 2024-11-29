import { Help } from '@prisma/client'
import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'
import { DataHelp } from '../../@types/Help'
import { createHelpSchema } from '../../schemas/helpSchema'

const CreateHelp = async (data: DataHelp): Promise<Help> => {
  const { title, description, video, link } = data

  try {
    await createHelpSchema.validate(data, { abortEarly: false })
  } catch (err: any) {
    throw new AppError(err.errors.join(', '), 400)
  }

  try {
    const createdHelp = await prisma.help.create({
      data: {
        title,
        description,
        video,
        link,
        updatedAt: new Date(),
      },
    })

    return createdHelp
  } catch (error: any) {
    console.error(`Error in CreateHelpService: ${error}`)
    throw new AppError('ERR_INTERNAL_SERVER_ERROR', 500)
  }
}

export default CreateHelp
