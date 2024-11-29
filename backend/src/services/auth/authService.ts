import { Request, Response } from 'express'
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from '../../utils/AccessToken'
import authConfig from '../../configs/authConfig'
import ShowUser from '../user/ShowUser'
import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'
import { LoginCredentials } from '../../@types/Auth'
import * as Yup from 'yup'
import { User } from '@prisma/client'

// Definindo esquemas de validação com Yup
const loginSchema = Yup.object({
  userId: Yup.number().required(),
  companyId: Yup.number().required(),
})

const refreshTokenSchema = Yup.object({
  refreshToken: Yup.string().required(),
})

export const AuthService = {
  async login(req: Request, res: Response): Promise<void> {
    const { userId, companyId } = req.body as LoginCredentials

    try {
      await validateLoginCredentials({ userId, companyId })
      const authenticatedUser = await ShowUser(Number(userId))

      if (!authenticatedUser) {
        throw new AppError('ERR_USER_NOT_FOUND', 404)
      }

      const accessToken = generateAccessToken({ userId, companyId })
      const refreshToken = generateRefreshToken({ userId, companyId })

      res.json({ accessToken, refreshToken })
    } catch (error: any) {
      handleError(error, res)
    }
  },

  async refreshToken(req: Request, res: Response): Promise<{ user: User, newToken: string, refreshToken: string }> {
    const refreshToken = req.body.refreshToken as string
    try {
      await validateRefreshToken({ refreshToken })
      const decoded = verifyToken(refreshToken, authConfig.refreshSecret)

      if ( !decoded || !decoded.userId || !decoded.companyId || !decoded.tokenVersion ) {
        throw new AppError('ERR_INVALID_REFRESH_TOKEN', 401)
      }

      const { userId, companyId } = decoded as LoginCredentials
      const user = await prisma.user.findUnique({ where: { id: Number(userId) } })

      if (!user || user.tokenVersion !== decoded.tokenVersion) {
        throw new AppError('ERR_INVALID_REFRESH_TOKEN', 401)
      }

      const newAccessToken = generateAccessToken({ userId, companyId })
      return { user, newToken: newAccessToken, refreshToken }
    } catch (error: any) {
      handleError(error, res)
    }
  },

  async logout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie('accessToken')
      res.clearCookie('refreshToken')
      res.json({ message: 'Logout realizado com sucesso' })
    } catch (error: any) {
      handleError(error, res)
    }
  },
}

// Função para validar as credenciais de login
async function validateLoginCredentials(credentials: LoginCredentials) {
  try {
    await loginSchema.validate(credentials)
  } catch (error: any) {
    throw new AppError('Invalid login credentials', 400)
  }
}

// Função para validar o token de refresh
async function validateRefreshToken({
  refreshToken,
}: {
  refreshToken: string
}) {
  try {
    await refreshTokenSchema.validate({ refreshToken })
  } catch (error: any) {
    throw new AppError('Invalid refresh token', 400)
  }
}

// Função para tratamento de erros
function handleError(error: any, res: Response) {
  console.error('Erro:', error)
  if (error instanceof AppError) {
    res.status(error.statusCode || 500).json({ error: error.message })
  } else {
    res.status(500).json({ error: 'Erro desconhecido' })
  }
}
