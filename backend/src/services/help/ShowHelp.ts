import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'
import { Help } from '@prisma/client'

const ShowHelp = async (id: number): Promise<Help> => {
  const record = await prisma.help.findUnique({ where: { id } })
  if (!record) {
    throw new AppError('ERR_NO_HELP_FOUND', 404)
  }

  return record
}

export default ShowHelp
