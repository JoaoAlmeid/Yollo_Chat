import { Response, NextFunction } from 'express'
import prisma from '../prisma/client'
import AppError from '../errors/AppError'
import { AuthenticatedRequest } from 'src/@types/Auth'

(prisma as any).$on('beforeRequest', (event: any) => {
  const req = event.context as AuthenticatedRequest | undefined;
  if (req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AppError('Acesso não permitido: sem autorização', 401);
    }

    const token = authHeader.split(' ')[1];

    event.args.headers = {
      ...event.args.headers,
      Authorization: `Bearer ${token}`
    }

  }
})

const tokenAuth = async ( req: AuthenticatedRequest, res: Response, next: NextFunction ): Promise<void> => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) { 
      throw new AppError('Acesso não permitido: Cabeçalho de autorização ausente', 401) 
    }

    const token = authHeader.replace('Bearer ', '')

    const whatsapp = await prisma.whatsapp.findFirst({ where: { token } })

    if (!whatsapp) {
      throw new AppError('Acesso não permitido: WhatsApp não encontrado', 401)
    }

    req.whatsappId = whatsapp.id.toString()

    return next()
  } catch (err) {
    console.error('Erro na autenticação do token: ', err)
    throw new AppError('Acesso não permitido', 401)
  }
}

export default tokenAuth