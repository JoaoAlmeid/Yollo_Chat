import { Request, Response } from 'express'
import AppError from 'src/errors/AppError'
import { getIO } from 'src/libs/socket'
import prisma from '../../prisma/client'
import { head } from 'lodash'
import path from 'path'
import fs from 'fs'

// Services
import CreateSchedule from '../../services/schedule/CreateSchedule'
import DeleteSchedule from '../../services/schedule/DeleteSchedule'
import ListSchedule from '../../services/schedule/ListSchedule'
import ShowSchedule from '../../services/schedule/ShowSchedule'
import UpdateSchedule from '../../services/schedule/UpdateSchedule'
import { IndexQuery } from './types'

class ScheduleController {
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const { searchParam, contactId, userId, pageNumber } = req.query as IndexQuery
      const { companyId } = req.user

      const { schedules, count, hasMore } = await ListSchedule({
        searchParam,
        contactId,
        userId,
        pageNumber,
        companyId,
      })
      return res.status(200).json({ schedules, count, hasMore })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperar agenda" })
      throw new AppError(`Ocorreu um erro ao recuperar agenda: ${error.message}`, 500)
    }
  }

  public async store(req: Request, res: Response): Promise<Response> {
    try {
      const { body, sendAt, contactId, userId } = req.body
      const { companyId } = req.user

      const schedule = await CreateSchedule({
        body,
        sendAt,
        contactId,
        companyId,
        userId,
      })

      const io = getIO()
      io.emit("schedule", {
        action: "create",
        schedule
      })

      return res.status(200).json(schedule)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao criar agenda" })
      throw new AppError(`Ocorreu um erro ao criar agenda: ${error.message}`, 500)
    }
  }

  public async show(req: Request, res: Response): Promise<Response> {
    try {
      const { scheduleId } = req.params
      const { companyId } = req.user
      
      const schedule = await ShowSchedule(scheduleId, companyId)
      return res.status(200).json(schedule)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao exibir agenda" })
      throw new AppError(`Ocorreu um erro ao exibir agenda: ${error.message}`, 500)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      if (req.user.profile !== "admin") {
        throw new AppError("ERR_NO_PERMISSION", 403)
      }
      const { scheduleId } = req.params
      const scheduleData = req.body
      const { companyId } = req.user

      const schedule = await UpdateSchedule({
        scheduleData,
        id: scheduleId,
        companyId,
      })

      const io = getIO()
      io.emit("schedule", {
        action: "update",
        schedule
      })

      return res.status(200).json(schedule)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao atualizar agenda" })
      throw new AppError(`Ocorreu um erro ao atualizar agenda: ${error.message}`, 500)
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { scheduleId } = req.params
      const { companyId } = req.user

      await DeleteSchedule(scheduleId, companyId)

      const io = getIO()
      io.emit("schedule", {
        action: "delete",
        scheduleId
      })

      return res.status(200).json({ message: "Agenda deletada" })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao deletar agenda" })
      throw new AppError(`Ocorreu um erro ao deletar agenda: ${error.message}`, 500)
    }
  }

  public async mediaUpload(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const files = req.files as Express.Multer.File[]
      const file = head(files)

      await prisma.schedule.update({
        where: { id: Number(id) },
        data:{
          mediaName: file.originalname,
          mediaPath: file.filename
        }
      })

      return res.status(200).send({ mensagem: "Arquivo anexado" })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao anexar arquivo" })
      throw new AppError(`Ocorreu um erro ao anexar arquivo: ${error.message}`, 500)
    }
  }

  public async deleteMedia(req: Request, res: Response): Promise<Response> {
    const { id } = req.params
    
    try {
      const schedule = await prisma.schedule.findUnique({
        where: { id: Number(id) }
      })

      if (!schedule) {
        throw new AppError("Agenda não encontrada", 404)
      }

      const filePath = path.resolve("public", schedule.mediaPath || "")
      const fileExists = fs.existsSync(filePath)

      if (fileExists) { fs.unlinkSync(filePath) }

      await prisma.schedule.update({
        where: { id: Number(id) },
        data: {
          mediaPath: null,
          mediaName: null
        }
      })

      return res.status(200).json({ mensagem: "Arquivo deletado" })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao deletar arquivo" })
      throw new AppError(`Ocorreu um erro ao deletar arquivo: ${error.message}`, 500)
    }
  }
}

export default new ScheduleController()