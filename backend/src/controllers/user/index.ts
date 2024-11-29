import { Request, Response } from 'express'
import AuthUser from '../../services/user/AuthUser'
import CreateUser from '../../services/user/CreateUser'
import DeleteUser from '../../services/user/DeleteUser'
import ListUsers from '../../services/user/ListUsers'
import ShowUser from '../../services/user/ShowUser'
import UpdateUser from '../../services/user/UpdateUser'
import SimpleList from '../../services/user/SimpleList'
import { IndexQuery } from './types'
import AppError from 'src/errors/AppError'
import CheckSettings from 'src/helpers/CheckSettings'
import { getIO } from 'src/libs/socket'


class UserController {
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const { searchParam, pageNumber } = req.query as IndexQuery
      const { companyId, profile } = req.user

      const { users, count, hasMore } = await ListUsers({
        searchParam,
        pageNumber,
        companyId,
        profile
      })

      return res.status(200).json({ users, count, hasMore })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperar usuários" })
      throw new AppError(`Ocorreu um erro ao recuperar usuários: ${error.message}`, 500)
    }
  }

  public async store(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password, name, profile, companyId: bodyCompanyId, queueIds, whatsappId } = req.body
      let userCompanyId: number | null = null

      if (req.user !== undefined) {
        const { companyId: cId } = req.user
        userCompanyId = cId
      }

      if (req.url === "/registrar" && (await CheckSettings("userCreation")) === "disabled") {
        throw new AppError("ERR_USER_CREATION_DISABLED", 403)
      } else if (req.url !== "/registrar" && req.user.profile !== "admin") {
        throw new AppError("ERR_NO_PERMISSION", 403)
      }

      const user = await CreateUser({
        email, 
        password,
        name,
        profile,
        companyId: bodyCompanyId || userCompanyId,
        queueIds,
        whatsappId
      })

      const io = getIO()
      io.emit(`company-${userCompanyId}-user`, {
        action: "create",
        user
      })

      return res.status(200).json(user)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao criar usuário" })
      throw new AppError(`Ocorreu um erro ao criar usuário: ${error.message}`, 500)
    }
  }

  public async show(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params
      const user = await ShowUser(userId)
      return res.status(200).json(user)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao exibir usuário" })
      throw new AppError(`Ocorreu um erro ao exibir usuário: ${error.message}`, 500)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      if (req.user.profile !== "admin") {
        throw new AppError("ERR_NO_PERMISSION", 403)
      }

      const { id: requestUserId, companyId } = req.user
      const { userId } = req.params
      const userData = req.body

      const updatedUser = await UpdateUser({
        userData,
        userId,
        companyId,
        requestUserId: +requestUserId,
      })

      const io = getIO()
      io.emit(`company-${companyId}-user`, {
        action: "uodate",
        updatedUser
      })

      return res.status(200).json(updatedUser)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao atualizar usuário" })
      throw new AppError(`Ocorreu um erro ao atualizar usuário: ${error.message}`, 500)
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params
      const { companyId } = req.user

      if (req.user.profile !== "admin") {
        throw new AppError("ERR_NO_PERMISSION", 403)
      }

      await DeleteUser(userId, companyId)
      
      const io = getIO()
      io.emit(`company-${companyId}-user`, {
        action: "delete",
        userId
      })

      return res.status(200).json({ message: "Usuário deletado" })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao deletar usuário" })
      throw new AppError(`Ocorreu um erro ao deletar usuário: ${error.message}`, 500)
    }
  }

  public async list(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.query
      const { companyId: userCompanyId } = req.user

      const users = await SimpleList({
        companyId: companyId ? +companyId : userCompanyId
      })

      return res.status(200).json(users)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao listar usuário" })
      throw new AppError(`Ocorreu um erro ao listar usuário: ${error.message}`, 500)
    }
  }
}

export default new UserController()
