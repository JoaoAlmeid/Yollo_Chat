import { Router } from 'express'
import chatController from '../../controllers/chat'
import isAuth from 'src/middlewares/isAuth'

const chatRoutes = Router()

chatRoutes.get("/chat", isAuth, chatController.index)

chatRoutes.get('/chat/:id', isAuth, chatController.show)

chatRoutes.get('/chat/:id/mensagens', isAuth, chatController.messages)

chatRoutes.post('/chat/:id/mensagens', isAuth, chatController.saveMessage)

chatRoutes.post('/chat/:id/lidas', isAuth, chatController.checkAsRead)

chatRoutes.post('/chat', isAuth, chatController.store)

chatRoutes.put('/chat/:id', isAuth, chatController.update)

chatRoutes.delete('/chat/:id', isAuth, chatController.delete)

export default chatRoutes