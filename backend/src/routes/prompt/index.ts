import { Router } from 'express'
import PromptController from 'src/controllers/prompt'
import isAuth from 'src/middlewares/isAuth'

const promptsRoutes = Router()
promptsRoutes.use(isAuth)

promptsRoutes.get('/prompt', PromptController.index)
promptsRoutes.post('/prompt', PromptController.store)

promptsRoutes.get('/prompt/:promptId', PromptController.show)
promptsRoutes.put('/prompt/:promptId', PromptController.update)
promptsRoutes.delete('/prompt/:promptId', PromptController.delete)

export default promptsRoutes