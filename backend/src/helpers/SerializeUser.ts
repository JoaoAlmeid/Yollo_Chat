import { Company, Queue, User } from '@prisma/client'
import prisma from '../prisma/client'

interface SerializedUser {
  id: number
  name: string
  email: string
  profile: string
  companyId: number
  company: Company | null
  super: boolean
  queues: Queue[]
}

export const SerializeUser = async (user: User): Promise<SerializedUser> => {
  const usuario = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      company: true,
      queues: true
    }
  })

  if (!usuario) {
    throw new Error("Usuário não encontrado")
  }

  return {
    id: usuario.id,
    name: usuario.name,
    email: usuario.email,
    profile: usuario.profile,
    companyId: usuario.companyId,
    company: usuario.company,
    super: usuario.super,
    queues: usuario.queues,
  }
}
