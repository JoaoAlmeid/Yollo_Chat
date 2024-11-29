import prisma from "../../prisma/client"
import { Request, Response } from "express"
import AppError from "../../errors/AppError"
import { getIO } from "../../libs/socket"
import { verify } from "jsonwebtoken"

import CreatePromptService from "src/services/prompt/CreatePrompt"
import DeletePromptService from "src/services/prompt/DeletePrompt"
import ListPromptsService from "src/services/prompt/ListPrompts"
import ShowPromptService from "src/services/prompt/ShowPrompt"
import UpdatePromptService from "src/services/prompt/UpdatePrompt"
import authConfig from "src/configs/authConfig"
import { IndexQuery, TokenPayload } from "./types"

class PromptsController {
  async index(req: Request, res: Response): Promise<Response> {
    try {
      const { pageNumber, searchParam } = req.query as IndexQuery

      // Validação de usuário
      const authHeader = req.headers.authorization
      if (!authHeader) { throw new AppError('Token não fornecido', 401)}

      const [, token] = authHeader.split(" ")
      if (!token) { throw new AppError('Formato do token é inválido', 401)}

      const decoded = verify(token, authConfig.secret)
      const { companyId } = decoded as TokenPayload
  
      const { prompts, count, hasMore } = await ListPromptsService({
        searchParam,
        pageNumber,
        companyId
      })
  
      return res.status(200).json({ prompts, count, hasMore })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperar prompt" })
      throw new AppError(`Ocorreu um erro ao recuperar prompt: ${error.message}`, 500)
    }
  }

  async store(req: Request, res: Response): Promise<Response> {
    try {
      // Validação de usuário
      const authHeader = req.headers.authorization
      if (!authHeader) { throw new AppError('Token não fornecido', 401)}

      const [, token] = authHeader.split(" ")
      if (!token) { throw new AppError('Formato do token é inválido', 401)}

      const decoded = verify(token, authConfig.secret)
      const { companyId } = decoded as TokenPayload
      const { 
        name, 
        apiKey, 
        prompt, 
        maxTokens, 
        temperature, 
        promptTokens, 
        completionTokens, 
        totalTokens, 
        queueId, 
        maxMessages, 
        voice, 
        voiceKey, 
        voiceRegion } = req.body
  
  
      const promptTable = await CreatePromptService({
        name,
        apiKey,
        prompt,
        maxTokens,
        temperature,
        promptTokens,
        completionTokens,
        totalTokens,
        queueId,
        maxMessages,
        companyId,
        voice,
        voiceKey,
        voiceRegion
      })
  
      const io = getIO()
      io.emit("prompt", {
        action: "create",
        prompt: promptTable
      })
  
      return res.status(200).json(promptTable)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao criar prompt" })
      throw new AppError(`Ocorreu um erro ao criar prompt: ${error.message}`, 500)
    }
  }

  async show(req: Request, res: Response): Promise<Response> {
    try {
      const { promptId } = req.params

      // Validação de usuário
      const authHeader = req.headers.authorization
      if (!authHeader) { throw new AppError('Token não fornecido', 401)}

      const [, token] = authHeader.split(" ")
      if (!token) { throw new AppError('Formato do token é inválido', 401)}

      const decoded = verify(token, authConfig.secret)
      const { companyId } = decoded as TokenPayload
  
      const prompt = await ShowPromptService({ promptId, companyId })
  
      return res.status(200).json(prompt)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao exibir prompt" })
      throw new AppError(`Ocorreu um erro ao exibir prompt: ${error.message}`, 500)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { promptId } = req.params
      const promptData = req.body

      // Validação de usuário
      const authHeader = req.headers.authorization
      if (!authHeader) { throw new AppError('Token não fornecido', 401)}

      const [, token] = authHeader.split(" ")
      if (!token) { throw new AppError('Formato do token é inválido', 401)}

      const decoded = verify(token, authConfig.secret)
      const { companyId } = decoded as TokenPayload
  
      const prompt = await UpdatePromptService({
        promptData,
        promptId: promptId,
        companyId
      })
  
      const io = getIO()
      io.emit("prompt", {
        action: "update",
        prompt
      })
  
      return res.status(200).json(prompt)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao atualizar prompt" })
      throw new AppError(`Ocorreu um erro ao atualizar prompt: ${error.message}`, 500)
    }
  }
    
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { promptId } = req.params

      // Validação de usuário
      const authHeader = req.headers.authorization
      if (!authHeader) { throw new AppError('Token não fornecido', 401)}

      const [, token] = authHeader.split(" ")
      if (!token) { throw new AppError('Formato do token é inválido', 401)}

      const decoded = verify(token, authConfig.secret)
      const { companyId } = decoded as TokenPayload

      // Verifica se há registros associados
      const associatedcount = await prisma.whatsapp.count({
        where: { promptId: +promptId, companyId }
      })
  
      if (associatedcount > 0) {
        return res.status(400).json({
          message: "Não é possivel deletar prompt! Está sendo usando em conexão aberta"
        })
      }
  
      await DeletePromptService(promptId, companyId)
  
      const io = getIO()
      io.emit("prompt", {
        action: "delete",
        intelligenceId: +promptId
      })
  
      return res.status(200).json({ message: "Prompt deletado com sucesso" })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao deletar prompt" })
      throw new AppError(`Ocorreu um erro ao deletar prompt: ${error.message}`, 500)
    }
  }
}

export default new PromptsController()
