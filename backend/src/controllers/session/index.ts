import { Request, Response } from "express"
import AppError from "../../errors/AppError"
import { getIO } from "../../libs/socket"
import prisma from "../../prisma/client"

import AuthUserService from "src/services/user/AuthUser"
import { AuthService } from "src/services/auth/authService"
import FindUserFromToken from "src/services/auth/FindUserFromToken"
import { SendRefreshToken } from "../../helpers/SendRefreshToken"

class SessionController {
  public async store(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body
  
      const { token, serializedUser, refreshToken } = await AuthUserService({ email, password })


      if (!serializedUser) {
        return res.status(401).json({ error: 'Credenciais inválidas' })
      }
  
      SendRefreshToken(res, refreshToken)
  
      const io = getIO()
      io.emit(`company-${serializedUser.companyId}-auth`, {
        action: "update",
        user: {
          id: serializedUser.id,
          email: serializedUser.email,
          companyId: serializedUser.companyId
        }
      })
      return res.status(200).json({ token, user: serializedUser })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperar sessão" })
      throw new AppError(`Ocorreu um erro ao recuperar sessão: ${error.message}`, 500)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const token: string = req.cookies.jrt
      if (!token) { 
        throw new AppError("Erro sessão expirada", 401)
      }

      const { user, newToken, refreshToken } = await AuthService.refreshToken(req, res)
      SendRefreshToken(res, refreshToken)
      return res.status(200).json({ token: newToken, user })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao atualizar sessão" })
      throw new AppError(`Ocorreu um erro ao atualizar sessão: ${error.message}`, 500)
    }
  }

  public async me(req: Request, res: Response): Promise<Response> {
    try {
      const token: string = req.cookies.jrt
      const user = await FindUserFromToken(token)
      const { id, profile, super: superAdmin } = user
      
      if (!token) {
        throw new AppError("ERR_SESSION_EXPIRED", 401)
      }
      
      return res.status(200).json({ id, profile, super: superAdmin })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperar sessão" })
      throw new AppError(`Ocorreu um erro ao recuperar sessão: ${error.message}`, 500)
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.user
      if (!id) { throw new AppError('Id do usuário não encontrado', 404) }

      await prisma.user.update({
          where: { id },
          data: { online: false }
      })
      res.clearCookie("jrt")
      return res.status(200).json({
        message: "Sessão deletada"
      })
  } catch (error: any) {
    console.error(error.message)
    res.status(500).json({ error: "Ocorreu um erro ao deletar sessão" })
    throw new AppError(`Ocorreu um erro ao deletar sessão: ${error.message}`, 500)
  }
  }
}

export default new SessionController()