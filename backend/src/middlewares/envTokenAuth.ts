import { Request, Response, NextFunction } from 'express'
import AppError from '../errors/AppError'

type TokenPayload = {
  token: string | undefined;
}

const envTokenAuth = ( req: Request, res: Response, next: NextFunction ): void => {
  try {
    const { token: bodyToken } = req.body as TokenPayload
    const { token: queryToken } = req.query as unknown as TokenPayload

    if (queryToken === process.env.ENV_TOKEN || bodyToken === process.env.ENV_TOKEN) { return next() }

    throw new AppError('Token inválido', 403)
  } catch (error: any) {
    console.error('Erro na autenticação do token:', error)
    throw new AppError('Erro na autenticação do token', 500)
  }
}

export default envTokenAuth