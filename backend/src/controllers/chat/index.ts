import { Request, Response } from 'express'
import AppError from '../../errors/AppError'
import { getIO } from 'src/libs/socket'
import prisma from '../../prisma/client'
import ListChatsService from '../../services/chat/List'
import UpdateChatService from '../../services/chat/Update'
import CreateChatService from '../../services/chat/Create'
import DeleteChatService from '../../services/chat/Delete'
import ShowChatService from '../../services/chat/Show'
import CreateMessageService from 'src/services/chat/CreateMessage'
import FindMessages from 'src/services/chat/FindMessages'
import { IndexQuery, StoreData } from './types'

class ChatController {
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const { pageNumber } = req.query as unknown as IndexQuery
      const ownerId = +req.user.id
  
      const { records, count, hasMore } = await ListChatsService({
        ownerId,
        pageNumber
      })
  
      return res.status(200).json({ records, count, hasMore })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperar chat" })
      throw new AppError(`Ocorreu um erro ao recuperar chat: ${error.message}`, 500)
    }
  }

  public async store(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user
      const ownerId = +req.user.id
      const data = req.body as StoreData

      const chat = await CreateChatService({
        ...data,
        ownerId,
        companyId
      })

      chat.users.forEach((user) => {
        const io = getIO()
        io.emit(`company-${companyId}-chat-user-${user.userId}`, {
          action: "create",
          chat
        })
      })
      return res.status(200).json(chat)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao criar chat" })
      throw new AppError(`Ocorreu um erro ao criar chat: ${error.message}`, 500)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user
      const data = req.body
      const { id } = req.params

      const chat = await UpdateChatService({
        ...data,
        id: +id
      })

      chat.users.forEach((user) => {
        const io = getIO()
        io.emit(`company-${companyId}-chat-user-${user.userId}`, {
          action: "update",
          chat
        })
      })
      return res.status(200).json(chat)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao atualizar chat" })
      throw new AppError(`Ocorreu um erro ao atualizar chat: ${error.message}`, 500)
    }
  }

  public async show(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const chat = await ShowChatService(id)
      return res.status(200).json(chat)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao exibir chat" })
      throw new AppError(`Ocorreu um erro ao exibir chat: ${error.message}`, 500)
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { companyId } = req.user

      await DeleteChatService(Number(id))

      const io = getIO()
      io.emit(`company-${companyId}-chat`, { action: "delete", id })

      return res.status(200).json({ message: "Chat deletado" })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao deletar chat" })
      throw new AppError(`Ocorreu um erro ao deletar chat: ${error.message}`, 500)
    }
  }

  public async saveMessage(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user
      const { message } = req.body
      const { id } = req.params
      const senderId = +req.user.id
      const chatId = +id
      
      const newMessage = await CreateMessageService({
        chatId,
        senderId,
        message
      })

      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        include: {
          company: { select: { id: true, name: true } },
          users: { include: { user: true } }
        }
      });

      if (!chat) { 
        throw new AppError('Chat não encontrado', 404) 
      }
    
      const io = getIO()
      io.emit(`company-${companyId}-chat-${chatId}`, {
        action: "new-message",
        newMessage,
        chat
      });
    
      io.emit(`company-${companyId}-chat`, {
        action: "new-message",
        newMessage,
        chat
      });
    
      return res.status(200).json(newMessage);
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao salvar mensagem" })
      throw new AppError(`Ocorreu um erro ao salvar mensagem: ${error.message}`, 500)
    }
  }

  public async checkAsRead(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user
      const { userId } = req.body
      const { id } = req.params
      
      await prisma.chatUser.updateMany({
        where: {
          chatId: +id,
          userId: +userId
        },
        data: {
          unreads: 0
        }
      })

      const chat = await prisma.chat.findUnique({
        where: { id: +id },
        include: {
          company: { select: { id: true, name: true } },
          users: { include: { user: true } }
        }
      })

      if (!chat) { 
        throw new AppError('Chat não encontrado', 404) 
      }
      
      const io = getIO()
      io.emit(`company-${companyId}-chat-${id}`, {
        action: "update",
        chat
      });

      io.emit(`company-${companyId}-chat`, {
        action: "update",
        chat
      });

      return res.status(200).json(chat);
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro desconhecido" })
      throw new AppError(`Ocorreu um erro desconhecido: ${error.message}`, 500)
    }
  }

  public async messages(req: Request, res: Response): Promise<Response> {
    try {
      const { pageNumber } = req.query as unknown as IndexQuery
      const { id: chatId } = req.params
      const ownerId = +req.user.id
      
      const { records, count, hasMore } = await FindMessages({
        chatId,
        ownerId,
        pageNumber
      })
      return res.json({ records, count, hasMore })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro desconhecido" })
      throw new AppError(`Ocorreu um erro desconhecido: ${error.message}`, 500)
    }
  }
}

export default new ChatController()
